import { useMemo } from 'react'
import { CheckIcon, Loader, PlusCircleIcon } from 'lucide-react'
import { type IconName, DynamicIcon } from 'lucide-react/dynamic'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export namespace FacetedFilter {
  export type Option = {
    label: string
    value: string
    icon?: IconName | (string & {}) | null
  }

  export type Props = FacetedFilterTrigger.Props &
    Omit<FacetedFilterItem.Props, 'option'> & {
      loading?: boolean
      onClear: () => void
    }
}

/**
 * Multiselect data table filter with badges
 * @see https://github.com/satnaing/shadcn-admin/blob/main/src/features/users/components/data-table-faceted-filter.tsx
 * @demo https://shadcn-admin.netlify.app/users
 */
export function FacetedFilter(props: FacetedFilter.Props) {
  const { active, title, loading, options, facets, onSelect, onClear } = props
  const selectedValues = new Set(active)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button disabled={loading} variant="outline" size="sm" className="h-8 border-dashed">
          {loading ? (
            <p className="space-x-1 text-xs">
              <Loader className="inline animate-spin" />
              <span>{title}</span>
            </p>
          ) : (
            <FacetedFilterTrigger
              title={title}
              max={props.max}
              options={options}
              active={selectedValues}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                return (
                  <FacetedFilterItem
                    key={option.value}
                    option={option}
                    active={selectedValues}
                    onSelect={onSelect}
                    facets={facets}
                  />
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={onClear} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export namespace FacetedFilterTrigger {
  export type Props = {
    title: string
    options: FacetedFilter.Option[]
    max?: number
    active: Set<string>
  }
}

function FacetedFilterTrigger(props: FacetedFilterTrigger.Props) {
  const { title, options, active, max } = props
  const selected = useMemo(() => {
    return options.filter((option) => active.has(option.value))
  }, [options, active])

  return (
    <>
      <PlusCircleIcon className="h-4 w-4" />
      {title}
      {active?.size > 0 && (
        <>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
            {active.size}
          </Badge>
          <div className="hidden space-x-1 lg:flex">
            {!max || active.size > max ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {active.size} selected
              </Badge>
            ) : (
              selected.map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="rounded-sm px-1 font-normal"
                >
                  {option.label}
                </Badge>
              ))
            )}
          </div>
        </>
      )}
    </>
  )
}

export namespace FacetedFilterItem {
  export type Props = {
    option: FacetedFilter.Option
    active: Set<string>
    onSelect: (value: string) => void
    facets: Map<unknown, number> | undefined
  }
}

function FacetedFilterItem(props: FacetedFilterItem.Props) {
  const { option, active, onSelect, facets } = props

  const isSelected = active.has(option.value)
  return (
    <CommandItem key={option.value} onSelect={() => onSelect(option.value)}>
      <div
        className={cn(
          'border-primary flex h-4 w-4 items-center justify-center rounded-sm border',
          isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
        )}
      >
        <CheckIcon className={cn('text-background h-4 w-4')} />
      </div>
      {option.icon && (
        <DynamicIcon name={option.icon as IconName} className="text-muted-foreground h-4 w-4" />
      )}
      <span>{option.label}</span>
      {facets?.get(option.value) && (
        <span className="ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
          {facets.get(option.value)}
        </span>
      )}
    </CommandItem>
  )
}
