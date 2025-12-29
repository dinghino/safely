'use client'

import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import type { Place } from '@/entities/places/types'
import { createPlaceContextConsumer } from './place-context'

export namespace PlaceThumbnailComponent {
  export interface Props {
    place: Pick<Place, '_id'> & { photos?: string[] }
    className?: string
    aspectRatio?: 'square' | 'video' | 'portrait'
  }
}

/**
 * Prototype thumbnail component for a place.
 * This won't work since right now places do not have images associated to them,
 * but it is kinda useful to design ui elements that will be used in the future.
 */
export function PlaceThumbnailComponent(props: PlaceThumbnailComponent.Props) {
  const { place, className, aspectRatio = 'video' } = props
  const { _id, photos } = place

  // Deterministic placeholder using place ID
  const placeholderUrl = `https://picsum.photos/seed/${_id}/800/600`
  const imageUrl = photos?.[0] || placeholderUrl

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-t-xl bg-muted',
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        aspectRatio === 'portrait' && 'aspect-3/4',
        className,
      )}
    >
      <Image
        src={imageUrl}
        alt="Place thumbnail"
        fill
        className="object-cover transition-transform duration-500 hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
    </div>
  )
}

export const PlaceThumbnail = createPlaceContextConsumer(PlaceThumbnailComponent)
