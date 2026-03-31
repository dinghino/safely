import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import { CategoryIcon } from '../categories'
import type { Place } from '@/entities/places/types'

export namespace PlaceTitleComponent {
  export interface Props {
    place: Pick<Place, 'name' | 'category'>
    className?: string
    showCategory?: boolean
  }
}

export function PlaceTitleComponent(props: PlaceTitleComponent.Props) {
  const { place, className, showCategory = true } = props
  const { name, category } = place

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <h3 className="line-clamp-1 font-bold text-lg leading-snug tracking-tight">{name}</h3>

      <div className="flex flex-wrap gap-1.5">
        {category && showCategory && (
          <Badge variant="secondary" className="h-5 px-1.5 font-medium text-[10px]">
            <CategoryIcon icon={category.icon} className="mr-1 size-3" />
            {category.name}
          </Badge>
        )}
      </div>
    </div>
  )
}
