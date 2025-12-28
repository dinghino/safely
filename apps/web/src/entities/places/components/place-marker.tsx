'use client'

import { useRef, useEffect } from 'react'
import type { Marker } from 'leaflet'
import { Point } from 'leaflet'

import { FancyMarkerIcon, MapMarker, MapPopup } from '@/shared/modules/maps'

import { CategoryIconStatic } from '@/entities/places/categories'
import type { Place } from '@/entities/places/types'

import PlacePopupContent from './place-popup'

export namespace PlaceMarker {
  export type Props = {
    place: Place
    isFocused?: boolean
    onOpen?: () => void
    onClose?: () => void
  }
}

export const PlaceMarker = ({ place, isFocused, onOpen, onClose }: PlaceMarker.Props) => {
  const { category, coordinates } = place
  const markerRef = useRef<Marker>(null)

  // Declarative popup control
  useEffect(() => {
    if (isFocused && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [isFocused])

  if (!coordinates) return null

  return (
    <MapMarker
      ref={markerRef}
      icon={
        category && (
          <FancyMarkerIcon data-role="place-wrapper" className="p-1">
            <CategoryIconStatic
              icon={category.icon}
              style={{ color: category.color.value }}
              className="size-5"
            />
          </FancyMarkerIcon>
        )
      }
      position={[coordinates.latitude, coordinates.longitude]}
      eventHandlers={{
        popupopen: () => onOpen?.(),
        popupclose: () => onClose?.(),
      }}
    >
      <MapPopup minWidth={220} offset={new Point(0, -10)}>
        <PlacePopupContent place={place} />
      </MapPopup>
    </MapMarker>
  )
}
