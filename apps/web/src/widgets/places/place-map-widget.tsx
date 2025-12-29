'use client'

import { latLngBounds } from 'leaflet'

import { cn } from '@/lib/utils'

import type { MapQueryBounds } from '@workspace/backend/types'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'

import { ScrapedCellsLayer } from '@/shared/modules/admin/place-coverage/components/scraped-cells-layer'
import { PlacesMapLayer } from '@/features/place-map/components'

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
