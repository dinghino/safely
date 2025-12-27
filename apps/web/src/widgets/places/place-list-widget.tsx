'use client'

import { PlaceCard } from '@/entities/places/components/place-card/place-card'
import { cn } from '@/lib/utils'
import { Spinner } from '@workspace/ui/components/spinner'
import { usePlacesMap } from '@/features/place-map'

export namespace PlaceListWidget {
  export type Props = {
    className?: string
  }
}

/**
 * List widget for places.
 * Displays filtered places from PlacesMapProvider with click-to-focus functionality.
 */
export const PlaceListWidget = ({ className }: PlaceListWidget.Props) => {
  const { filteredPlaces, isLoading, focusOnPlace } = usePlacesMap()

  return (
    <div className={cn('flex flex-col gap-2 overflow-hidden', className)}>
      <h2 className="px-1 font-semibold text-sm">Places in View ({filteredPlaces?.length ?? 0})</h2>

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        )}

        {!isLoading && (!filteredPlaces || filteredPlaces.length === 0) && (
          <p className="p-4 text-center text-muted-foreground text-xs">No places in this area</p>
        )}

        <ul className="flex flex-col gap-1">
          {filteredPlaces?.map((place) => (
            <PlaceCard key={place._id} place={place} onClick={() => focusOnPlace(place._id)} />
          ))}
        </ul>
      </div>
    </div>
  )
}
