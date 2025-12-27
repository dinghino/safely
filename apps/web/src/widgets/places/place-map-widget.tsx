'use client'

import { useMemo, useEffect } from 'react'
import { useMapEvents } from 'react-leaflet/hooks'
import { latLngBounds } from 'leaflet'

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
  }
}

/**
 * Map widget for places exploration.
 * Renders the Leaflet map with place markers from PlacesMapProvider.
 */
export const PlaceMapWidget = ({ children }: PlaceMapWidget.Props) => {
  return (
    <MapContainer bounds={toLatLngTuple(INITIAL_BOUNDS)} className="h-full flex-1">
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
        <PlacesMapLayer />
        {children}
      </MapLayers>
    </MapContainer>
  )
}
export namespace PlacesMapLayer {
  export type Props = {
    name?: string
  }
}
/**
 * Map layer group for places markers.
 * Depends on {@link usePlacesMap} from {@link PlacesMapProvider} to provide the places data.
 */
export function PlacesMapLayer({ name = 'places' }: PlacesMapLayer.Props) {
  const { places, setBounds, focusedPlace } = usePlacesMap()
  // Map event handling
  const map = useMapEvents({
    moveend: () => {
      const _bounds = leafletMapBoundsToMapQueryBounds({ map })
      setBounds(_bounds)
    },
  })

  useEffect(() => {
    if (focusedPlace?.coordinates) {
      map.setView([focusedPlace.coordinates.latitude, focusedPlace.coordinates.longitude], 14)
    }
  }, [focusedPlace, map])

  const iconNames = useMemo(() => {
    if (!places) return []
    return Array.from(new Set(places.map((p) => p.category.icon.name)))
  }, [places])

  return (
    <>
      <PoiIconSymbols names={iconNames} />
      <MapLayerGroup name={name}>
        {places?.map((place) => (
          <PlaceMarker key={place._id} place={place} />
        ))}
      </MapLayerGroup>
    </>
  )
}
