import { cn } from '@workspace/ui/lib/utils'
import type { Place } from '@/entities/places/types'

export namespace PlaceLocationComponent {
  export interface Props {
    place: Pick<Place, 'coordinates'>
    className?: string
    title?: boolean
  }
}

export function PlaceLocationComponent(props: PlaceLocationComponent.Props) {
  const { place, className, title = false } = props
  const { coordinates } = place

  if (!coordinates) return null

  return (
    <div className={cn('inline-flex items-center justify-between gap-1', className)}>
      {title && <span className="font-medium text-muted-foreground text-xs">Location</span>}
      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
      </span>
    </div>
  )
}
