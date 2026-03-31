import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { Place } from '@/entities/places/types'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export namespace PlaceAttributionComponent {
  export interface Props {
    place: Pick<Place, 'attribution'>
    className?: string
    showTitle?: boolean
  }
}
/**
 * Shows the original attribution of a place if the data comes originally from
 * another source.
 *
 * @returns `null` if attribution is not available (i.e. place was added
 * directly in our platform)
 */
export function PlaceAttributionComponent(props: PlaceAttributionComponent.Props) {
  const { place, className, showTitle = true } = props
  const { attribution } = place

  if (!attribution) return null

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {showTitle && <span className="font-medium text-muted-foreground text-xs">Source</span>}
      <Badge variant="outline" className="h-6 pr-0 font-medium text-[9px] uppercase tracking-wider">
        {attribution.source}
        {attribution.url && <PlaceAttributionLink place={place} />}
      </Badge>
    </div>
  )
}

export function PlaceAttributionLink(props: PlaceAttributionComponent.Props) {
  const { place } = props
  const { attribution } = place

  if (!attribution?.url) return null

  return (
    <Button asChild size="icon" variant="secondary">
      <Link href={{ href: attribution.url }} target="_blank" rel="noreferrer">
        {/* View on {attribution.source} */}
        <ExternalLink className="size-3" />
      </Link>
    </Button>
  )
}
