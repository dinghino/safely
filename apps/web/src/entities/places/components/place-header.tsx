'use client'

import { cn } from '@workspace/ui/lib/utils'
import { CategoryIcon } from '@/entities/places/categories'
import type { Place } from '@/entities/places/types'

export namespace PlaceHeaderComponent {
  export interface Props {
    place: Pick<Place, 'name' | 'category'>
    className?: string
    size?: 'sm' | 'md' | 'lg'
  }
}

export function PlaceHeaderComponent(props: PlaceHeaderComponent.Props) {
  const { place, className, size = 'md' } = props
  const { name, category } = place

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl transition-colors',
          size === 'sm' ? 'size-8' : size === 'md' ? 'size-10' : 'size-12',
        )}
        style={{ backgroundColor: `${category?.color.value}15` }}
      >
        <CategoryIcon
          icon={category?.icon}
          style={{ color: category?.color.value }}
          className={cn(size === 'sm' ? 'size-5' : size === 'md' ? 'size-6' : 'size-8')}
        />
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden">
        <h3
          className={cn(
            'line-clamp-2 font-bold text-foreground leading-snug tracking-tight',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
          )}
          title={name}
        >
          {name}
        </h3>
        {category && (
          <span
            className={cn(
              'font-semibold text-muted-foreground uppercase tracking-wider',
              size === 'sm' ? 'text-[8px]' : 'text-[10px]',
            )}
          >
            {category.name}
          </span>
        )}
      </div>
    </div>
  )
}
