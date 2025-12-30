'use client'

import { useMemo, useEffect } from 'react'
import { useMapEvents } from 'react-leaflet/hooks'
import { latLngBounds } from 'leaflet'

import { cn } from '@/lib/utils'

import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'

import { ButtonGroup } from '@workspace/ui/components/button-group'

import { MapLayerGroup } from '@/shared/modules/maps'
import { leafletMapBoundsToMapQueryBounds } from '@/shared/modules/maps/lib'

import { ScrapedCellsLayer } from '@/shared/modules/admin/place-coverage/components/scraped-cells-layer'

import { PlaceMarker } from '@/entities/places/components/place-marker'
import { PoiIconSymbols } from '@/entities/places/places-icon-symbols'

import { usePlacesMap } from '@/features/place-map'
import type { MapQueryBounds } from '@workspace/backend/types'

const INITIAL_BOUNDS = {
  sw: { lat: 43.84399877553671, lng: 11.06778144836426 },
  ne: { lat: 43.881129336188245, lng: 11.231546401977539 },
} satisfies MapQueryBounds

function toLatLngTuple(bounds: MapQueryBounds) {
  return latLngBounds(bounds.sw, bounds.ne)
}

export namespace PlaceMapWidget {
  export type Props = {
    /**
     * extra map layers and layer groups to render
     */
    children?: React.ReactNode
    className?: string
  }
}

/**
 * Map widget for places exploration.
 * Renders the Leaflet map with place markers from PlacesMapProvider.
 */
export const PlaceMapWidget = (props: PlaceMapWidget.Props) => {
  const { children, className } = props
  return (
    <MapContainer bounds={toLatLngTuple(INITIAL_BOUNDS)} className={cn('h-full flex-1', className)}>
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['places']}>
        <MapTileLayer />
        <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />

        <ButtonGroup
          orientation="vertical"
          className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
        >
          <MapZoomControl orientation="vertical" className="static" />
          <MapLocateControl className="static" />
          <MapLayersControl className="static" />
        </ButtonGroup>

        <ScrapedCellsLayer />
        <PlacesMapLayer focusOnClick />
        {children}
      </MapLayers>
    </MapContainer>
  )
}
export namespace PlacesMapLayer {
  export type Props = {
    name?: string
    /** if true will focus on the place when clicked through the context, making it available
     * for other components to use
     */
    focusOnClick?: boolean
    /**
     * zoom level to use when focusing on a place. if undefined
     * the map will keep its current zoom level
     */
    focusZoom?: number
  }
}
/**
 * Map layer group for places markers.
 * Depends on {@link usePlacesMap} from {@link PlacesMapProvider} to provide the places data.
 */
export function PlacesMapLayer(props: PlacesMapLayer.Props) {
  const { name = 'places', focusOnClick, focusZoom } = props
  const { places, setBounds, focusedPlace, focusOnPlace } = usePlacesMap()
  // Map event handling
  const map = useMapEvents({
    moveend: () => {
      const _bounds = leafletMapBoundsToMapQueryBounds({ map })
      setBounds(_bounds)
    },
  })

  useEffect(() => {
    if (!focusedPlace) return
    const { coordinates } = focusedPlace
    map.setView([coordinates.latitude, coordinates.longitude], focusZoom)
  }, [focusedPlace, map, focusZoom])

  const iconNames = useMemo(() => {
    if (!places) return []
    return Array.from(new Set(places.map((p) => p.category.icon.name)))
  }, [places])

  return (
    <>
      <PoiIconSymbols names={iconNames} />
      <MapLayerGroup name={name}>
        {places?.map((place) => {
          const isFocused = focusedPlace?._id === place._id
          return (
            <PlaceMarker
              key={place._id}
              place={place}
              isFocused={isFocused}
              onOpen={() => {
                if (!isFocused && focusOnClick) focusOnPlace(place._id)
              }}
              onClose={() => {
                if (isFocused) focusOnPlace(place._id)
              }}
            />
          )
        })}
      </MapLayerGroup>
    </>
  )
}
