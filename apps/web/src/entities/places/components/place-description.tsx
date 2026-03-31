import { cn } from '@workspace/ui/lib/utils'
import type { Place } from '@/entities/places/types'

export namespace PlaceDescriptionComponent {
  export interface Props {
    // snippet or description might not be in the base Place type yet
    place: Pick<Place, 'description'>
    className?: string
    maxLines?: number
  }
}

export function PlaceDescriptionComponent(props: PlaceDescriptionComponent.Props) {
  const { place, className, maxLines = 2 } = props
  const { description } = place

  if (!description) return null

  return (
    <p
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {description}
    </p>
  )
}
