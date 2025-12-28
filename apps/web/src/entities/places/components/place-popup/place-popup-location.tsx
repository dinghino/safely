'use client'

import { usePlacePopup } from './place-popup-context'

export namespace PlacePopupLocation {
  export type Props = Record<string, never>
}

export const PlacePopupLocation = () => {
  const { coordinates } = usePlacePopup()

  if (!coordinates) return null

  return (
    <div className="flex items-center justify-between border-b border-dashed pb-1">
      <span className="text-muted-foreground">Location</span>
      <span className="rounded bg-muted px-1 font-mono text-[10px]">
        {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
      </span>
    </div>
  )
}
