'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Star } from 'lucide-react'
import type { Place } from '@/entities/places/types'
import { createPlaceContextConsumer } from './place-context'

export namespace PlaceRatingComponent {
  export interface Props {
    // Rating might not be in the base Place type yet, so we allow it to be optional
    place: Pick<Place, '_id'> & { rating?: number; reviewCount?: number }
    className?: string
    showReviewCount?: boolean
    size?: 'sm' | 'md'
  }
}
/**
 * Renders a place rating and review count.
 * @note rating system is not implemented as time of writing (12/2025) so this
 * component API will likely change in the future.
 */
export function PlaceRatingComponent(props: PlaceRatingComponent.Props) {
  const { place, className, showReviewCount = true, size = 'sm' } = props
  const { rating, reviewCount, _id } = place

  // Use a deterministic mock rating if not provided (for development)
  const mockRating = (Math.abs(Number(_id.toString().substring(0, 2)) % 15) / 10 + 3.5).toFixed(1)
  const mockReviews = Math.floor(Math.abs(Number(_id.toString().substring(3, 5)) % 500))

  const displayRating = rating ?? Number(mockRating)
  const displayReviews = reviewCount ?? mockReviews

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-md bg-green-50 px-1.5 py-0.5 font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        <Star className={cn('fill-current', size === 'sm' ? 'size-3' : 'size-4')} />
        {displayRating}
      </div>
      {showReviewCount && (
        <span className="text-[11px] text-muted-foreground">({displayReviews} reviews)</span>
      )}
    </div>
  )
}

export const PlaceRating = createPlaceContextConsumer(PlaceRatingComponent)
