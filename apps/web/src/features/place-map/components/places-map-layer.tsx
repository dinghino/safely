'use client'

import { useMemo, useEffect } from 'react'
import { useMapEvents } from 'react-leaflet/hooks'
import { MapLayerGroup } from '@/shared/modules/maps'
import { leafletMapBoundsToMapQueryBounds } from '@/shared/modules/maps/lib'

import { PoiIconSymbols } from '@/entities/places/places-icon-symbols'
import { PlaceMarker } from './place-marker'
import { usePlacesMap } from '../contexts'

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
