'use client'

import { Point } from 'leaflet'

import {
  FancyMarkerIcon,
  MapMarker,
  MapPopup,
} from '@/shared/modules/maps'

import { CategoryIconStatic } from '@/entities/places/categories'
import type { Place } from '@/entities/places/types'

import PlacePopupContent from './place-popup'

export namespace PlaceMarker {
  export type Props = {
    place: Place
  }
}

export const PlaceMarker = ({ place }: PlaceMarker.Props) => {
  const { category, coordinates } = place

  if (!coordinates) return null

  return (
    <MapMarker
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
    >
      <MapPopup minWidth={220} offset={new Point(0, -10)}>
        <PlacePopupContent place={place} />
      </MapPopup>
    </MapMarker>
  )
}
