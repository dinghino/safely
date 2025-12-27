'use client'

import type { Place } from '@/entities/places/types'
import { PlacePopupProvider } from './place-popup-context'
import { PlacePopupHeader } from './place-popup-header'
import { PlacePopupLocation } from './place-popup-location'
import { PlacePopupAttribution } from './place-popup-attribution'

export namespace PlacePopupContent {
  export type Props = {
    place: Place
  }
}
/**
 * Composed leaflet popup content for places on the map.
 * @note this will likely become a factory component that will change its content
 * based on the place category/group to show different information.
 */
export const PlacePopupContent = ({ place }: PlacePopupContent.Props) => {
  return (
    <PlacePopupProvider value={place}>
      <div className="flex flex-col gap-3 p-1">
        <PlacePopupHeader />
        <div className="space-y-2 text-[11px]">
          <PlacePopupLocation />
          <PlacePopupAttribution />
        </div>
      </div>
    </PlacePopupProvider>
  )
}
