'use client'
import {
  PlaceDescription,
  PlaceHeader,
  PlaceLocation,
  PlaceProvider,
  PlaceRating,
  PlaceThumbnail,
} from '@/entities/places/components'
import type { Place } from '@/entities/places/types'
import { UserBadge } from '@/entities/users/components/user-badge'
import { usePlacesMap } from '@/features/place-map'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { ChevronRightIcon, HeartIcon, MapPinIcon, MoreVerticalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { useViewMode } from '@/components/view-mode-control'
import { useMemo } from 'react'

export function PlacesList() {
  const { places } = usePlacesMap()
  const { mode } = useViewMode()

  const memoized = useMemo(() => places.map(injectMockData), [places])

  return (
    <div
      className={cn({
        'flex flex-col gap-4': mode === 'list',
        'grid grid-cols-3 gap-4 max-[600px]:grid-cols-1': mode === 'grid',
      })}
    >
      {memoized.map((place) => (
        <PlaceCard key={place._id} place={place} />
      ))}
    </div>
  )
}

/**
 * Place card component
 * @todo (maybe?) transform in modular component
 * @todo make dumb component
 *  - [ ] pass callbacks for actions
 *  - [ ]
 */
function PlaceCard({ place }: { place: ReturnType<typeof injectMockData> }) {
  const { focusOnPlace } = usePlacesMap()

  return (
    <PlaceProvider key={place._id} place={place}>
      <Card className="@container gap-4 py-2 shadow-none transition-all hover:bg-muted/25">
        <CardHeader className="flex items-center justify-between px-2">
          <PlaceHeader size="md" className="flex-1" />
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" disabled>
                  <HeartIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Favorite</TooltipContent>
            </Tooltip>
            <Button variant="ghost" disabled>
              <MoreVerticalIcon />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid @max-[600px]:grid-cols-1 grid-cols-[auto_1fr] gap-4 px-2">
          <PlaceThumbnail
            aspectRatio="square"
            className="@max-[600px]:aspect-7/3 @max-[600px]:w-full w-48 rounded-md"
          />
          <div className="flex h-full flex-col gap-2">
            <PlaceDescription maxLines={2} className="text-muted-foreground/90 text-sm" />
            {/* todo: this is where we'll add a set of properties and features of the place */}
            <div className="flex-1" />
            <div className="inline-flex items-center justify-between gap-2">
              <PlaceRating showReviewCount={false} size="sm" />
              {place.addedBy && (
                <div className="inline-flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Added by</span>
                  <UserBadge user={place.addedBy} variant="secondary" rounded={false} />
                </div>
              )}
              {/* <PlaceRating showReviewCount={false} size="sm" /> */}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-between gap-4 px-2">
          <PlaceLocation />
          {/* <PlaceRating showReviewCount={false} size="sm" /> */}
          {/* {place.addedBy && <UserBadge user={place.addedBy} variant="secondary" />} */}
          <ButtonGroup>
            <Button variant="outline" size="sm" onClick={() => focusOnPlace(place._id)}>
              <MapPinIcon />
            </Button>
            <Button variant="outline" size="sm">
              See more
              <ChevronRightIcon />
            </Button>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </PlaceProvider>
  )
}

/**
 * Use this function to inject mock data into our places to design the cards
 * with our modular atoms even if we don't have the data yet
 */
function injectMockData(place: Place) {
  return {
    ...place,
    description: `${place.description ?? ''}\n\n${generateRandomDescription(2)}`,
    // random rating between 0 and 5, floor to 1 decimal place
    // @ts-expect-error property does not exist yet
    rating: Math.floor((place.rating ?? Math.random() * 5) * 10) / 10,
    // @ts-expect-error property does not exist yet
    reviewsCount: 5 + Math.floor(place.reviewsCount ?? Math.random() * 100),
  }
}

function generateRandomDescription(length: number) {
  const descriptions = [
    'A cozy and comfortable place to stay.',
    'A great place to relax and unwind.',
    'A perfect place to stay for a night or two.',
    'A great place to stay for a night or two.',
    'A perfect place to stay for a night or two.',
  ]
  return descriptions.slice(0, length).join('\n')
}
