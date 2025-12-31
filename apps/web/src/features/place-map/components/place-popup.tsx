'use client'

import type { Place } from '@/entities/places/types'

import {
  PlaceAttribution,
  PlaceHeader,
  PlaceLocation,
  PlaceProvider,
} from '@/entities/places/components'

import { UserBadge } from '@/entities/users/components'

export namespace PlacePopupContent {
  export type Props = {
    place: Place
  }
}

export const PlacePopupContent = ({ place }: PlacePopupContent.Props) => {
  return (
    <PlaceProvider place={place}>
      <div className="flex flex-col gap-3 p-1">
        <PlaceHeader size="md" />
        <div className="space-y-2">
          <PlaceLocation />
        </div>
        <div className="inline-flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Created by</span>
          {place.addedBy && <UserBadge user={place.addedBy} />}
        </div>
        <PlaceAttribution />
      </div>
    </PlaceProvider>
  )
}
