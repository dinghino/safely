'use client'

import { CategoryIcon, CategoryIconStatic, PoiCategoryColorBadge } from '@/entities/poi/categories'
import { PoiIconSymbols } from '@/entities/poi/places-icon-symbols'
import { usePoiCategoryGroups, usePoiGroupCategoriesById } from '@/features/poi-categories/hooks'
import { cn } from '@/lib/utils'
import type { Id } from '@workspace/backend/dataModel'
import { Badge } from '@workspace/ui/components/badge'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import Link from 'next/link'

/**
 * Main default page for places route.
 * This will show dynamic POIs based on user preferences and current location
 * in the future. for now, it shows category groups to select from
 */
export default function PoiCategoryGroupPage() {
  const groups = usePoiCategoryGroups()
  return (
    <>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Relevant places</EmptyTitle>
          <EmptyDescription>
            We have no places to show you at the moment. Try selecting a category group above to
            explore
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p>
            This section will contain user relevant places based on their preferences and location.
          </p>
        </EmptyContent>
      </Empty>
      <div className="mb-4 flex h-[800px] gap-4">
        <PoisList />
        <DemoPlacesMap />
      </div>

      <div className="space-y-4">
        {groups?.map((group) => (
          <article
            key={group._id}
            className={cn(
              'rounded-lg border border-dashed p-4 transition-colors hover:bg-muted dark:hover:bg-muted/10',
            )}
          >
            <div>
              <header
                className={cn(
                  'inline-flex items-center gap-2',
                  'relative isolate w-full cursor-pointer',
                )}
              >
                <Link href={`/places/${group.slug}`} className="absolute inset-0 z-10" />
                <PoiCategoryColorBadge data={group} className="size-4 rounded-md" />
                <h2 className="font-bold text-lg">{group.name}</h2>
              </header>
              <p className="text-muted-foreground text-sm">
                We have no places to show you at the moment. Try selecting a category group above to
                explore
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryLinks groupId={group._id} />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

const CategoryLinks = (props: { groupId: Id<'poiCategoryGroup'> }) => {
  const categories = usePoiGroupCategoriesById(props.groupId)

  return (
    <>
      {categories?.map((category) => (
        <Badge asChild variant="secondary" key={category._id}>
          <Link
            href={`/places/${category.group.slug}/${category.slug}`}
            className="inline-flex items-center gap-1"
          >
            <CategoryIcon icon={category.icon} />
            <span>{category.name}</span>
          </Link>
        </Badge>
      ))}
    </>
  )
}

import { useEffect, useMemo, useState } from 'react'
import {
  FancyMarkerIcon,
  Map as MapContainer,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapMarker,
  MapTileLayer,
  MapTiles,
  MapZoomControl,
} from '@/shared/modules/maps'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { Rectangle, Tooltip, useMapEvents } from 'react-leaflet'
import type { FunctionReturnType } from 'convex/server'
import { latLngBounds } from 'leaflet'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Button } from '@workspace/ui/components/button'
import { PoisList } from '@/widgets/places/places-list'
import { Point } from 'leaflet'
import { MapPopup } from '@/shared/modules/maps'

const INITIAL_BOUNDS = {
  sw: { lat: 43.84399877553671, lng: 11.06778144836426 },
  ne: { lat: 43.881129336188245, lng: 11.231546401977539 },
}
function toLatLngTuple(bounds: {
  sw: { lat: number; lng: number }
  ne: { lat: number; lng: number }
}) {
  return latLngBounds(bounds.sw, bounds.ne)
}
export const DemoPlacesMap = () => {
  return (
    <MapContainer bounds={toLatLngTuple(INITIAL_BOUNDS)} className="h-full flex-1">
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['places' /* 'cells' */]}>
        {/* tiles */}
        <MapTileLayer />
        <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />
        {/* controls */}
        <ButtonGroup
          orientation="vertical"
          className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
        >
          <MapZoomControl orientation="vertical" className="static" />
          <ButtonGroup orientation="vertical">
            <MapLocateControl className="static" />
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <MapLayersControl className="static" />
          </ButtonGroup>
        </ButtonGroup>
        {/* layers */}
        <ScrapedCellsLayer />
        <PlacesMapLayer />
      </MapLayers>
    </MapContainer>
  )
}

function useMapScrapedCells() {
  const [bounds, setBounds] = useState(INITIAL_BOUNDS)

  // Synchronize with map movement
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      const sw = b.getSouthWest()
      const ne = b.getNorthEast()
      setBounds({ sw, ne })
    },
  })

  const cells = useQuery(api.pois.get.scrapedCells, { bounds })
  const [cachedCells, setCachedCells] = useState(cells)

  useEffect(() => {
    if (!cells) return
    setCachedCells(cells)
  }, [cells])

  return cachedCells
}

type Cell = FunctionReturnType<typeof api.pois.get.scrapedCells>[number]

function CellItem({ cell }: { cell: Cell }) {
  const color = cell.status === 'done' ? '#22c55e' : '#eab308' // green-500 : yellow-500
  const bbox = cell.bbox
  // Leaflet Rectangle takes [ [lat, lng], [lat, lng] ]
  const bounds: [[number, number], [number, number]] = [
    [bbox.minLat, bbox.minLon],
    [bbox.maxLat, bbox.maxLon],
  ]

  const totalPois = Object.values(cell.counts || {}).reduce((a, b) => a + b, 0)

  return (
    <Rectangle
      key={cell._id}
      bounds={bounds}
      pathOptions={{
        color: color,
        weight: 0.5,
        fillOpacity: 0.05,
      }}
    >
      <Tooltip direction="center" opacity={0.15} sticky>
        <div className="font-bold text-[10px]">
          {cell.geohash}
          <br />
          {totalPois} pois
        </div>
      </Tooltip>
    </Rectangle>
  )
}

function ScrapedCellsLayer() {
  const cells = useMapScrapedCells()

  return (
    <MapLayerGroup name="cells">
      {cells?.map((cell) => (
        <CellItem key={cell._id} cell={cell} />
      ))}
    </MapLayerGroup>
  )
}

function useMapPlacesByBoundingBox() {
  const [bounds, setBounds] = useState(INITIAL_BOUNDS)

  /* Fire-and-forget coverage check */
  const ensureCoverage = useMutation(api.pois.view.ensureCoverage)

  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setBounds({ sw, ne })
      // Trigger background check/scrape
      // Default: all categories
      void ensureCoverage({ bounds: { sw, ne }, categories: [] })
    },
  })
  const data = useQuery(api.pois.get.inView, { bounds, categories: [] })

  const [cachedPois, setCachedPois] = useState(data?.pois)

  useEffect(() => {
    if (!data) return
    setCachedPois(data?.pois)
  }, [data])

  return { pois: cachedPois }
}

/**
 * Individual POI Marker with informative popup
 */
function PoiMarker({ poi }: { poi: any }) {
  const { category, coordinates } = poi
  return (
    <MapMarker
      icon={
        category && (
          <FancyMarkerIcon data-role="poi-wrappper" className="p-1">
            <CategoryIconStatic
              icon={category.icon}
              style={{ color: category.color.value }}
              className="size-5"
            />
          </FancyMarkerIcon>
        )
      }
      position={[coordinates.latitude, coordinates.longitude]}
    >
      <MapPopup minWidth={220} offset={new Point(0, -10)}>
        <PoiPopupContent poi={poi} />
      </MapPopup>
    </MapMarker>
  )
}

/**
 * Content for the POI Popup
 */
function PoiPopupContent({ poi }: { poi: any }) {
  const { name, category, coordinates, attribution } = poi

  return (
    <div className="flex flex-col gap-3 p-1">
      <header className="flex items-center gap-3 border-b pb-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${category.color.value}15` }}
        >
          <CategoryIconStatic
            icon={category.icon}
            style={{ color: category.color.value }}
            className="size-6"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <h3 className="line-clamp-2 font-bold text-sm leading-snug" title={name}>
            {name}
          </h3>
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            {category.name}
          </span>
        </div>
      </header>

      <div className="space-y-2 text-[11px]">
        <div className="flex items-center justify-between border-b border-dashed pb-1">
          <span className="text-muted-foreground">Location</span>
          <span className="rounded bg-muted px-1 font-mono text-[10px]">
            {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
          </span>
        </div>

        {attribution && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Source</span>
            <Badge variant="outline" className="h-4 px-1 text-[9px]">
              {attribution.source}
            </Badge>
          </div>
        )}
      </div>

      {attribution?.url && (
        <Button asChild size="sm" variant="secondary" className="mt-1 h-8 w-full text-[11px]">
          <a href={attribution.url} target="_blank" rel="noreferrer">
            View on {attribution.source}
          </a>
        </Button>
      )}
    </div>
  )
}

/**
 * Prototype component for places layer
 */
function PlacesMapLayer() {
  const { pois } = useMapPlacesByBoundingBox()

  const iconNames = useMemo(() => {
    if (!pois) return []
    return Array.from(new Set(pois.map((p) => p.category.icon.name)))
  }, [pois])

  return (
    <>
      <PoiIconSymbols names={iconNames} />
      <MapLayerGroup name="places">
        {pois?.map((poi) => (
          <PoiMarker key={poi._id} poi={poi} />
        ))}
      </MapLayerGroup>
    </>
  )
}
