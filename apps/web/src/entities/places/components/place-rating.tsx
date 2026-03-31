import { cn } from '@workspace/ui/lib/utils'
import { Star } from 'lucide-react'
import type { Place } from '@/entities/places/types'

export namespace PlaceRatingComponent {
  export interface Props {
    // Rating might not be in the base Place type yet, so we allow it to be optional
    place: Pick<Place, '_id'> & { rating?: number; reviewCount?: number }
    className?: string
    showReviewCount?: boolean
    size?: 'sm' | 'md'
    variant?: 'single' | 'multiple'
  }
}
/**
 * Renders a place rating and review count.
 * @note rating system is not implemented as time of writing (12/2025) so this
 * component API will likely change in the future.
 */
export function PlaceRatingComponent(props: PlaceRatingComponent.Props) {
  const { place, className, showReviewCount = true, size = 'sm', variant = 'multiple' } = props
  const { rating, reviewCount, _id } = place

  // Use a deterministic mock rating if not provided (for development)
  const mockRating = (Math.abs(Number(_id.toString().substring(0, 2)) % 15) / 10 + 3.5).toFixed(1)
  const mockReviews = Math.floor(Math.abs(Number(_id.toString().substring(3, 5)) % 500))

  const displayRating = rating ?? Number(mockRating)
  const displayReviews = reviewCount ?? mockReviews

  // round to the .5
  const roundedRating = Math.round(displayRating * 2) / 2
  const ratingColor = getStarColor(roundedRating)

  // make either the array or a single star depending on variant prop
  const stars =
    variant === 'single' ? (
      <Star className={cn(ratingColor, size === 'sm' ? 'size-3' : 'size-4')} />
    ) : (
      Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            {
              'fill-current': i < Math.floor(roundedRating),
              'text-current': i >= Math.floor(roundedRating),
            },
            size === 'sm' ? 'size-3' : 'size-4',
          )}
        />
      ))
    )

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold',
          ratingColor,
          {
            'h-5': variant === 'single',
            'h-6': variant === 'multiple',
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
          },
          getBackgroundColor(roundedRating),
        )}
      >
        {stars}
        {displayRating}
      </div>
      {showReviewCount && (
        <span className="text-[11px] text-muted-foreground">({displayReviews} reviews)</span>
      )}
    </div>
  )
}

function getStarColor(rating: number) {
  if (rating >= 4) return 'text-green-700 dark:text-green-400'
  if (rating >= 3) return 'text-yellow-700 dark:text-yellow-400'
  if (rating >= 2) return 'text-orange-700 dark:text-orange-400'
  if (rating >= 1) return 'text-red-700 dark:text-red-400'
  return 'text-muted-foreground'
}

function getBackgroundColor(rating: number) {
  if (rating >= 4) return 'bg-green-500/10'
  if (rating >= 3) return 'bg-yellow-500/10'
  if (rating >= 2) return 'bg-orange-500/10'
  if (rating >= 1) return 'bg-red-500/10'
  return 'bg-muted-foreground/10'
}
