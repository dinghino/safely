'use client'
import {
  injectMockData,
  type PlaceCard,
} from '@/app/(authenticated)/places/explore/components/places-list'
import { usePlacesMap } from '@/features/place-map'

// export default async function CatchallPlacesPage() {
//   return <PlacesList />
// }
export default function CatchallPlacesPage() {
  const { filteredPlaces } = usePlacesMap()

  return (
    <>
      {filteredPlaces.map((place) => {
        const data = injectMockData(place)
        return <SmallPlaceCard key={place._id} place={data} />
      })}
    </>
  )
}

import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import {
  PlaceDescription,
  PlaceHeader,
  PlaceProvider,
  PlaceRating,
  PlaceThumbnail,
} from '@/entities/places/components'
import { cn } from '@/lib/utils'
import { UserBadge } from '@/entities/users/components/user-badge'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SmallPlaceCard(props: React.ComponentProps<typeof PlaceCard>) {
  const { place } = props
  const pathname = usePathname()
  return (
    <PlaceProvider place={place}>
      <Card className={cn('@container gap-2 py-2', 'rounded-md', 'shadow-none')}>
        <Link
          className="absolute inset-0 z-10"
          href={{
            pathname: pathname,
            query: { place: place._id },
          }}
        />
        <CardHeader
          className={cn(
            'flex flex-wrap items-center justify-between px-2',
            '@max-[300px]:flex-col @max-[300px]:items-start',
          )}
        >
          <PlaceHeader size="md" className="min-w-fit flex-1" />
          <PlaceRating showReviewCount={false} size="sm" variant="single" />
        </CardHeader>
        <CardContent className="flex flex-row gap-2 px-2">
          <div className="flex flex-col">
            <PlaceDescription maxLines={2} className="flex-1 text-muted-foreground/90 text-xs" />
            <div className="inline-flex items-center justify-between">
              {/* <PlaceRating showReviewCount={false} size="sm" variant="single" /> */}

              {place.addedBy && (
                <UserBadge
                  user={place.addedBy}
                  variant="secondary"
                  rounded={false}
                  className="place-self-end"
                />
              )}
            </div>
          </div>
          <PlaceThumbnail aspect="square" className={cn('w-24 shrink-0', 'rounded-md')} />
        </CardContent>
      </Card>
    </PlaceProvider>
  )
}
