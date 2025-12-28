'use client'

import { CategoryIcon } from '@/entities/places/categories'
import type { Place } from '@/entities/places/types'
import { cn } from '@/lib/utils'

export namespace PlaceListItem {
  export type Props = {
    place: Place
    className?: string
    onClick?: () => void
  }
}

export const PlaceListItem = ({ place, className, onClick }: PlaceListItem.Props) => {
  return (
    <li>
      <button
        type="button"
        className={cn(
          'inline-flex w-full cursor-pointer items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-muted',
          className,
        )}
        onClick={onClick}
      >
        {place.category.icon && (
          <CategoryIcon
            icon={place.category.icon}
            style={{ color: place.category.color.value }}
            className="size-4 shrink-0"
          />
        )}
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
          {place.name}
        </span>
      </button>
    </li>
  )
}
