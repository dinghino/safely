import { useMemo } from 'react'
import { cn } from '@/lib/utils'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { getCategoryColor } from './lib'
import type { CategoryGroup, CategoryItem } from './types'
import { PlaceCategoryItem } from './components/category-item'

import { CategoryIcon, CategoryIconStatic } from './components/category-icon'
export { CategoryIcon, CategoryIconStatic }


export namespace PoiCategoryColorBadge {
  export type Props = {
    className?: string
    data: {
      color: {
        format: string
        value: string
      }
    }
  }
}
/**
 * A small badge showing the color of a POI category
 * Accepts both Category and CategoryGroup types
 * Customize size and shape via className
 */
export function PoiCategoryColorBadge(props: PoiCategoryColorBadge.Props) {
  const background = getCategoryColor(props.data)
  return (
    <div
      style={{ background }}
      className={cn('aspect-square size-2 rounded-full', props.className)}
    />
  )
}

export const PoiCategoryGroupName = (props: { group: CategoryGroup }) => {
  return <>{props.group ? props.group.name : 'No Group'}</>
}

export type PoiCategoryListProps = {
  categories: CategoryItem[]
}

type CategoriesMap = Map<string, CategoryItem[]>

export const PoiCategoryListComponent = ({ categories }: PoiCategoryListProps) => {
  const { data, descriptions } = useMemo(() => {
    const data: CategoriesMap = new Map()
    const descriptions = new Map<string, string>()

    for (const c of categories) {
      const key = c.group ? c.group.name : 'ungrouped'
      const arr = data.get(key) ?? []
      arr.push(c)
      data.set(key, arr)
      if (!descriptions.has(key)) {
        descriptions.set(key, c.group?.description ?? '')
      }
    }
    return { data, descriptions }
  }, [categories])

  return (
    <div className="space-y-6">
      {Array.from(data.entries()).map(([groupName, items]) => (
        <section key={groupName}>
          <header className="mb-2">
            <h3 className="font-semibold text-sm">{groupName}</h3>
            <span className="text-muted-foreground text-xs">{descriptions.get(groupName)}</span>
          </header>

          <div className="grid grid-cols-1 gap-2">
            {items.map((cat) => (
              <PlaceCategoryItem key={cat._id} category={cat} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export namespace CategoriesGroupFilterComponent {
  export type Props = {
    groups: CategoryGroup[]
    selectedGroupIds: string[]
    onChange: (selected: string[]) => void
  }
}
export const CategoriesGroupFilterComponent = (props: CategoriesGroupFilterComponent.Props) => {
  const toggleGroup = (groupId: string) => {
    if (props.selectedGroupIds.includes(groupId)) {
      props.onChange(props.selectedGroupIds.filter((id) => id !== groupId))
    } else {
      props.onChange([...props.selectedGroupIds, groupId])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {props.groups.map((group) => {
        const isSelected = props.selectedGroupIds.includes(group._id)
        return (
          <Button
            // asChild
            size="sm"
            key={group._id}
            variant={isSelected ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => toggleGroup(group._id)}
          >
            {/* <Badge> */}
            <PoiCategoryColorBadge data={group} />
            <span className="">{group.name}</span>
            {/* </Badge> */}
          </Button>
        )
      })}
    </div>
  )
}

export namespace CategoryBadge {
  export type Props = {
    category: CategoryItem
  } & React.ComponentProps<typeof Badge>
}
export const CategoryBadge = (props: CategoryBadge.Props) => {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-2"
      style={{ background: getCategoryColor(props.category) }}
    >
      <CategoryIcon icon={props.category.icon} className="size-4 text-white" />
      <span className="text-white">{props.category.name}</span>
    </Badge>
  )
}
