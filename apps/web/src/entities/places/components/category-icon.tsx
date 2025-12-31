import { cn } from '@/lib/utils'

import { type IconName, DynamicIcon } from 'lucide-react/dynamic'
import { getCategoryColor } from '@/entities/places/lib'
import type { CategoryItem } from '@/entities/places/types'

export const CategoryIcon = (
  props: {
    icon: { name: string }
  } & Omit<React.ComponentProps<typeof DynamicIcon>, 'name'>,
) => {
  const { icon = { name: 'circle' }, className, ...rest } = props

  return <DynamicIcon name={icon.name as IconName} className={cn('size-4', className)} {...rest} />
}

/**
 * Static version of CategoryIcon that uses SVG <use> tags.
 * Safe for server-side rendering and renderToString (Leaflet markers).
 * Requires PoiIconSymbols to be present in the document.
 */
export const CategoryIconStatic = (
  props: {
    icon: { name: string }
  } & React.SVGProps<SVGSVGElement>,
) => {
  const { icon = { name: 'circle' }, className, ...rest } = props

  return (
    <svg className={cn('size-4', className)} aria-hidden="true" {...rest}>
      <use href={`#poi-icon-${icon.name}`} />
    </svg>
  )
}

/**
 * Colorful variant of {@link CategoryIcon}
 * Separate component because it requires more information from a Category
 * than the icon
 */
export namespace ColoredCategoryIcon {
  export type Props = {
    category: Pick<CategoryItem, 'icon' | 'color'>
  } & Omit<React.ComponentProps<typeof DynamicIcon>, 'name'>
}

export const ColoredCategoryIcon = (props: ColoredCategoryIcon.Props) => {
  const { category, className, ...rest } = props
  const color = getCategoryColor(category)
  return (
    <CategoryIcon
      icon={category.icon}
      style={{ ...props.style, color }}
      className={cn('size-4', className)}
      {...rest}
    />
  )
}
