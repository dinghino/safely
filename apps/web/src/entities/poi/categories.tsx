import { cn } from '@/lib/utils'
import type { api } from '@workspace/backend/api'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import type { FunctionReturnType } from 'convex/server'
import { type IconName, DynamicIcon } from 'lucide-react/dynamic'
import { useMemo } from 'react'

// todo: move to types
export type PoiCategory = NonNullable<FunctionReturnType<typeof api.pois.categories.get>>
export type PoiCategoryGroup = NonNullable<FunctionReturnType<typeof api.pois.groups.get>>

export const CategoryIcon = (
  props: {
    icon: { name: string }
  } & Omit<React.ComponentProps<typeof DynamicIcon>, 'name'>,
) => {
  const { icon = { name: 'circle' }, className, ...rest } = props
  return <DynamicIcon name={icon.name as IconName} className={cn('size-4', className)} {...rest} />
}

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
  return (
    <div
      style={{ background: props.data.color.value }}
      className={cn('aspect-square size-2 rounded-full', props.className)}
    />
  )
}

export namespace PoiCategoryItem {
  export type Props = {
    category: PoiCategory
    className?: string
    showDescription?: boolean
  }
}

export const PoiCategoryItem = (props: PoiCategoryItem.Props) => {
  const { category, className = '', showDescription = true, ...rest } = props
  const bg = category.color?.value ?? '#E5E7EB'

  return (
    <div className={cn('flex items-center gap-3 p-2', className)} {...rest}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
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

export const PoiCategoryGroupName = (props: { group: PoiCategoryGroup }) => {
  return <>{props.group ? props.group.name : 'No Group'}</>
}

export type PoiCategoryListProps = {
  categories: PoiCategory[]
}

type CategoriesMap = Map<string, PoiCategory[]>

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
              <PoiCategoryItem key={cat._id} category={cat} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export namespace CategoriesGroupFilterComponent {
  export type Props = {
    groups: PoiCategoryGroup[]
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
    category: PoiCategory
  } & React.ComponentProps<typeof Badge>
}
export const CategoryBadge = (props: CategoryBadge.Props) => {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-2"
      style={{ background: props.category.color.value }}
    >
      <DynamicIcon
        name={(props.category.icon?.name ?? 'circle') as IconName}
        className="size-4 text-white"
      />
      <span className="text-white">{props.category.name}</span>
    </Badge>
  )
}
