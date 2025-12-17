/**
 * @file select components for poi categories
 *
 * Type-safe facade components wrapping shadcn MultiSelect with POI-specific adapters.
 * Provides single-select and multi-select variants for categories and groups.
 */
'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@workspace/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { Button } from '@workspace/ui/components/button'
import { MultiSelect } from '@workspace/ui/components/multi-select'
import type {
  MultiSelectOption,
  MultiSelectGroup,
  MultiSelectRef,
} from '@workspace/ui/components/multi-select'
import { CategoryIcon, PoiCategoryColorBadge } from './categories'
import type { CategoryGroup, CategoryItem } from './types'
import { getCategoryColor } from './lib'

// ID aliases (use `_id` from the domain types)
type GroupId = CategoryGroup['_id']
type CategoryId = CategoryItem['_id']

// ============================================================================
// Adapter Hooks - Transform POI data to MultiSelect format
// ============================================================================

/**
 * Converts CategoryGroup to MultiSelectOption
 */
function useGroupOptions(groups: CategoryGroup[]) {
  return React.useMemo(
    (): MultiSelectOption[] =>
      groups.map((group) => ({
        value: group._id,
        label: group.name,
        // Use border color instead of fill for cleaner look
        style: {
          borderColor: getCategoryColor(group),
          borderWidth: '1px',
        },
      })),
    [groups],
  )
}

/**
 * Converts CategoryItem array to flat MultiSelectOption array
 */
function useCategoryOptions(categories: CategoryItem[]) {
  return React.useMemo(
    (): MultiSelectOption[] =>
      categories.map((category) => {
        const color = getCategoryColor(category)
        return {
          value: category._id,
          label: category.name,
          // Add group name to search terms by including it in a hidden data attribute
          // MultiSelect searches both label and value, so we augment the search surface
          keywords: [category.group.name],
          // Use dynamic icon component with category color
          icon: (props) => <CategoryIcon icon={category.icon} style={{ color }} {...props} />,
          style: { borderColor: color, borderWidth: '1px', iconColor: color },
        }
      }),
    [categories],
  )
}

/**
 * Converts CategoryItem array to grouped MultiSelectGroup array
 */
function useGroupedCategoryOptions(categories: CategoryItem[]) {
  return React.useMemo((): MultiSelectGroup[] => {
    const groupMap = new Map<
      string,
      {
        group: CategoryGroup & { color: { format: string; value: string } }
        categories: CategoryItem[]
      }
    >()

    // Group categories by their group._id
    for (const category of categories) {
      if (!category.group) continue

      const key = category.group._id
      if (!groupMap.has(key)) {
        // Type assertion: API returns group with color even though type says it's optional
        groupMap.set(key, {
          group: category.group as CategoryGroup & { color: { format: string; value: string } },
          categories: [],
        })
      }
      groupMap.get(key)!.categories.push(category)
    }

    // Convert to MultiSelectGroup format
    return Array.from(groupMap.values()).map(({ group, categories }) => {
      const color = getCategoryColor(group)
      return {
        heading: group.name,
        options: categories.map((category) => ({
          value: category._id,
          label: category.name,
          keywords: [group.name],
          icon: (props) => <CategoryIcon icon={category.icon} style={{ color }} {...props} />,
          style: {
            borderColor: color,
            borderWidth: '1px',
            iconColor: color,
          },
        })),
      }
    })
  }, [categories])
}

// ============================================================================
// Helper for single-select variants
// ============================================================================

/** Groups categories by their group's `_id` for single-select */
function useCategoriesByGroup(categories: CategoryItem[]) {
  return React.useMemo(() => {
    const map = new Map<string, CategoryItem[]>()
    for (const category of categories) {
      const key = category.group?._id ?? 'ungrouped'
      const arr = map.get(key) ?? []
      arr.push(category)
      map.set(key, arr)
    }
    return map
  }, [categories])
}

// ============================================================================
// Atomic Components - Command Items
// ============================================================================

/**
 * Group item for use inside Command components
 */
export namespace GroupCommandItem {
  export type Props = {
    group: CategoryGroup
    isSelected?: boolean
    onSelect?: (group: CategoryGroup) => void
  }
}

export function GroupCommandItem({ group, isSelected, onSelect }: GroupCommandItem.Props) {
  return (
    <CommandItem
      value={group.slug}
      keywords={[group.name, group.slug]}
      onSelect={() => onSelect?.(group)}
      className="flex items-center gap-2"
    >
      <PoiCategoryColorBadge data={group} className="size-3" />
      <span className="flex-1">{group.name}</span>
      {isSelected && <Check className="size-4 shrink-0" />}
    </CommandItem>
  )
}

/**
 * Category item for use inside Command components
 */
export namespace CategoryCommandItem {
  export type Props = {
    category: CategoryItem
    isSelected?: boolean
    onSelect?: (category: CategoryItem) => void
  }
}

export function CategoryCommandItem({ category, isSelected, onSelect }: CategoryCommandItem.Props) {
  return (
    <CommandItem
      value={category.slug}
      keywords={[category.name, category.slug]}
      onSelect={() => onSelect?.(category)}
      className="flex items-center gap-2"
    >
      <CategoryIcon icon={category.icon} className="size-4 text-muted-foreground" />
      <span className="flex-1">{category.name}</span>
      {isSelected && <Check className="size-4 shrink-0" />}
    </CommandItem>
  )
}

// ============================================================================
// Group Select (single selection)
// ============================================================================

export namespace GroupSelect {
  export type Props = {
    groups: CategoryGroup[]
    value?: GroupId
    onValueChange?: (groupId?: GroupId) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
  }
}

/**
 * Single-select for POI category groups using Command API.
 * For multi-select, use GroupMultiSelect instead.
 */
export function GroupSelect({
  groups,
  value,
  onValueChange,
  placeholder = 'Select group...',
  emptyMessage = 'No groups found.',
  className,
  disabled,
}: GroupSelect.Props) {
  const [open, setOpen] = React.useState(false)
  const selectedGroup = groups.find((g) => g._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedGroup ? (
            <span className="flex items-center gap-2">
              <PoiCategoryColorBadge data={selectedGroup} className="size-3" />
              {selectedGroup.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <GroupCommandItem
                  key={group._id}
                  group={group}
                  isSelected={value === group._id}
                  onSelect={(g) => {
                    onValueChange?.(g._id === value ? undefined : g._id)
                    setOpen(false)
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// Group MultiSelect (multiple group selection)
// ============================================================================

export namespace GroupMultiSelect {
  export type Props = {
    groups: CategoryGroup[]
    value?: GroupId[]
    onValueChange?: (groupIds: GroupId[]) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    maxCount?: number
    /** Enable scrollable single-line badge display */
    singleLine?: boolean
    /** Enable responsive behavior */
    responsive?: boolean
  }
}

/**
 * Multi-select for POI category groups with badges and search.
 * Wraps shadcn MultiSelect with type-safe POI group adapters.
 */
export const GroupMultiSelect = React.forwardRef<MultiSelectRef, GroupMultiSelect.Props>(
  (props, ref) => {
    const {
      groups,
      value = [],
      onValueChange,
      placeholder = 'Select groups...',
      emptyMessage = 'No groups found.',
      className,
      disabled,
      maxCount = 3,
      singleLine = false,
      responsive = true,
    } = props

    const groupOptions = useGroupOptions(groups)

    const handleChange = (selectedIds: string[]) => {
      onValueChange?.(selectedIds as GroupId[])
    }

    return (
      <MultiSelect
        ref={ref}
        options={groupOptions}
        defaultValue={value}
        onValueChange={handleChange}
        placeholder={placeholder}
        emptyIndicator={emptyMessage}
        className={className}
        disabled={disabled}
        maxCount={maxCount}
        singleLine={singleLine}
        responsive={responsive}
        animationConfig={{
          badgeAnimation: 'none',
          popoverAnimation: 'scale',
        }}
      />
    )
  },
)

// ============================================================================
// Category Select (single selection, flat list)
// ============================================================================

export namespace CategorySelect {
  export type Props = {
    categories: CategoryItem[]
    value?: CategoryId
    onValueChange?: (categoryId?: CategoryId) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
  }
}

/**
 * Single-select for POI categories (flat list, no grouping).
 * For grouped display, use GroupedCategorySelect instead.
 */
export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Select category...',
  emptyMessage = 'No categories found.',
  className,
  disabled,
}: CategorySelect.Props) {
  const [open, setOpen] = React.useState(false)
  const selectedCategory = categories.find((c) => c._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <CategoryIcon icon={selectedCategory.icon} className="size-4" />
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CategoryCommandItem
                  key={category._id}
                  category={category}
                  isSelected={value === category._id}
                  onSelect={(c) => {
                    onValueChange?.(c._id === value ? undefined : c._id)
                    setOpen(false)
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// Grouped Category Select (single selection, organized by groups)
// ============================================================================

export namespace GroupedCategorySelect {
  export type Props = {
    categories: CategoryItem[]
    value?: CategoryId
    onValueChange?: (categoryId?: CategoryId) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
  }
}

/**
 * Single-select for POI categories organized by groups.
 * Categories are displayed under their respective group headings.
 */
export function GroupedCategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Select category...',
  emptyMessage = 'No categories found.',
  className,
  disabled,
}: GroupedCategorySelect.Props) {
  const [open, setOpen] = React.useState(false)

  const selectedCategory = categories.find((c) => c._id === value)
  // derive groups from categories (each category contains its group)
  const groups = React.useMemo(() => {
    const map = new Map<string, CategoryGroup>()
    for (const c of categories) {
      const g = (c as any).group as CategoryGroup | undefined
      if (g && !map.has(g._id)) map.set(g._id, g)
    }
    return Array.from(map.values())
  }, [categories])

  const selectedGroup = selectedCategory
    ? groups.find((g) => g._id === selectedCategory.group?._id)
    : undefined

  const categoriesByGroup = useCategoriesByGroup(categories)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              {selectedGroup && <PoiCategoryColorBadge data={selectedGroup} className="size-3" />}
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {groups.map((group, index) => {
              const groupCategories = categoriesByGroup.get(group._id)
              if (!groupCategories?.length) return null
              return (
                <React.Fragment key={group._id}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup
                    heading={
                      <span className="flex items-center gap-2">
                        <PoiCategoryColorBadge data={group} />
                        {group.name}
                      </span>
                    }
                  >
                    {groupCategories.map((category) => (
                      <CategoryCommandItem
                        key={category._id}
                        category={category}
                        isSelected={value === category._id}
                        onSelect={(c) => {
                          onValueChange?.(c._id === value ? undefined : c._id)
                          setOpen(false)
                        }}
                      />
                    ))}
                  </CommandGroup>
                </React.Fragment>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// Grouped Category MultiSelect (multiple selection, organized by groups)
// ============================================================================

export namespace GroupedCategoryMultiSelect {
  export type Props = {
    categories: CategoryItem[]
    value?: CategoryId[]
    onValueChange?: (categoryIds: CategoryId[]) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    maxCount?: number
    /** Enable scrollable single-line badge display */
    singleLine?: boolean
    /** Enable responsive behavior */
    responsive?: boolean
  }
}

/**
 * Multi-select for POI categories organized by groups.
 * Wraps shadcn MultiSelect with type-safe POI category adapters.
 * Features: scrollable badges, responsive design, search, animations.
 */
export const GroupedCategoryMultiSelect = React.forwardRef<
  MultiSelectRef,
  GroupedCategoryMultiSelect.Props
>((props, ref) => {
  const {
    categories,
    value = [],
    onValueChange,
    placeholder = 'Select categories...',
    emptyMessage = 'No categories found.',
    className,
    disabled,
    maxCount = 3,
    singleLine = false,
    responsive = true,
  } = props
  const groupedOptions = useGroupedCategoryOptions(categories)

  const handleChange = (selectedIds: string[]) => {
    onValueChange?.(selectedIds as CategoryId[])
  }

  return (
    <MultiSelect
      ref={ref}
      options={groupedOptions}
      defaultValue={value}
      onValueChange={handleChange}
      placeholder={placeholder}
      emptyIndicator={emptyMessage}
      className={className}
      disabled={disabled}
      maxCount={maxCount}
      singleLine={singleLine}
      responsive={responsive}
    />
  )
})

// ============================================================================
// Category MultiSelect (flat, no grouping)
// ============================================================================

export namespace CategoryMultiSelect {
  export type Props = {
    categories: CategoryItem[]
    value?: CategoryId[]
    onValueChange?: (categoryIds: CategoryId[]) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    maxCount?: number
    /** Enable scrollable single-line badge display */
    singleLine?: boolean
    /** Enable responsive behavior */
    responsive?: boolean
  }
}

/**
 * Multi-select for POI categories (flat list, no grouping).
 * Wraps shadcn MultiSelect with type-safe POI category adapters.
 * Features: scrollable badges, responsive design, search, animations.
 */
export const CategoryMultiSelect = React.forwardRef<MultiSelectRef, CategoryMultiSelect.Props>(
  (props, ref) => {
    const {
      categories,
      value = [],
      onValueChange,
      placeholder = 'Select categories...',
      emptyMessage = 'No categories found.',
      className,
      disabled,
      maxCount = 3,
      singleLine = false,
      responsive = true,
    } = props
    const categoryOptions = useCategoryOptions(categories)

    const handleChange = (selectedIds: string[]) => {
      onValueChange?.(selectedIds as CategoryId[])
    }

    return (
      <MultiSelect
        ref={ref}
        options={categoryOptions}
        defaultValue={value}
        onValueChange={handleChange}
        placeholder={placeholder}
        emptyIndicator={emptyMessage}
        className={className}
        disabled={disabled}
        maxCount={maxCount}
        singleLine={singleLine}
        responsive={responsive}
      />
    )
  },
)
