import type { PoiCategory } from '@workspace/backend/types'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '../categories'
import { getCategoryColor } from '../lib'

export namespace PlaceCategoryItem {
  export type ComponentProps = {
    category: PoiCategory
    className?: string
    showDescription?: boolean
  }
  export type Props = ComponentProps & {
    variant?: 'sm' | 'lg'
  }
}

export const PlaceCategoryItem = ({ variant = 'sm', ...props }: PlaceCategoryItem.Props) => {
  switch (variant) {
    case 'lg':
      return <LargePlaceCategoryItem {...props} />
    default:
      return <SmallPlaceCategoryItem {...props} />
  }
}

export const SmallPlaceCategoryItem = (props: PlaceCategoryItem.ComponentProps) => {
  const { category, className = '', showDescription = true, ...rest } = props
  const bg = getCategoryColor(category)

  return (
    <div className={cn('flex items-center gap-3 p-1.5', className)} {...rest}>
      <div
        className="flex shrink-0 items-center justify-center rounded-lg p-1.5"
        style={{ background: bg }}
        aria-hidden
      >
        <CategoryIcon icon={category.icon} className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-sm">{category.name}</div>
        {showDescription && category.description ? (
          <div className="text-muted-foreground text-xs">{category.description}</div>
        ) : null}
      </div>
    </div>
  )
}

export const LargePlaceCategoryItem = (props: PlaceCategoryItem.ComponentProps) => {
  const { category, className = '', showDescription = true, ...rest } = props
  const color = getCategoryColor(category)

  return (
    <article
      className={cn(
        // 'rounded-lg border border-muted',
        'transition-colors',
        'hover:bg-muted dark:hover:bg-muted/10',
        'flex flex-row gap-4 p-4',
        'relative isolate cursor-pointer',
        className,
      )}
      {...rest}
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <CategoryIcon icon={category.icon} style={{ color }} className="size-8" />
      </div>
      <header className="w-full gap-2">
        <h2 className="font-bold text-lg">{category.name}</h2>
        {showDescription && (
          <p className="mt-1 text-muted-foreground text-xs">{category.description}</p>
        )}
      </header>
    </article>
  )
}
