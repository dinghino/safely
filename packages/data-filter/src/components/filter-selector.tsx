import React from 'react'
import { isValidElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, XIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'

import type { Column, ColumnDataType } from '../core/types'
import { isAnyOf } from '../lib/array'
import { getColumn } from '../lib/helpers'
import { t } from '../lib/i18n'
import { FilterValueController } from './filter-value'
import { useDataFilterContext } from './data-filter.context'

// interface FilterSelectorProps<TData> {
//   filters: FiltersState
//   columns: Column<TData>[]
//   actions: DataTableFilterActions
//   strategy: FilterStrategy
//   locale?: Locale
// }

export const FilterSelector = memo(FilterSelector__Internal) as typeof FilterSelector__Internal

// fixme: never props needed for memoization for now
// todo: split into 2 subviews: main command and sub page(s)
function FilterSelector__Internal<TData>(_props: { _?: never }) {
  const { filters, columns, locale = 'en' } = useDataFilterContext<TData>()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [property, setProperty] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const column = property ? getColumn(columns, property) : undefined
  const filter = property ? filters.find((f) => f.columnId === property) : undefined

  const hasFilters = filters.length > 0

  useEffect(() => {
    if (property && inputRef) {
      inputRef.current?.focus()
      setValue('')
    }
  }, [property])

  useEffect(() => {
    if (!open) setTimeout(() => setValue(''), 150)
  }, [open])

  const content = useMemo(() => {
    if (property && column)
      return (
        <>
          <div className="w-full p-1">
            <Button
              onClick={() => setProperty(undefined)}
              className="h-fit w-full justify-start p-1!"
              // size="sm"
              variant="ghost"
            >
              <ChevronLeftIcon />
              Back
            </Button>
          </div>
          <Separator />
          <FilterValueController
            filter={filter!}
            column={column as Column<TData, ColumnDataType>}
          />
        </>
      )
    return (
      <Command
        loop
        filter={(value, search, keywords) => {
          const extendValue = `${value} ${keywords?.join(' ')}`
          return extendValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
        }}
        // we can highlight this somehow
        className=""
      >
        <div className="relative isolate">
          <CommandInput
            value={value}
            onValueChange={setValue}
            ref={inputRef}
            placeholder={t('search', locale)}
            autoFocus
          />
          {value && (
            <Button
              variant="ghost"
              className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6"
              onClick={() => setValue('')}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
        <CommandList className="max-h-fit">
          <CommandGroup>
            {columns.map((column) => (
              <FilterableColumn key={column.id} column={column} setProperty={setProperty} />
            ))}
            <QuickSearchFilters search={value} />
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }, [property, column, filter, value, locale, columns])

  return (
    <Popover
      open={open}
      onOpenChange={async (value) => {
        setOpen(value)
        if (!value) setTimeout(() => setProperty(undefined), 100)
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-7', hasFilters && '!px-2 w-fit')}>
          <FilterIcon className="size-4" />
          {!hasFilters && <span>{t('filter', locale)}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-fit origin-(--radix-popover-content-transform-origin) p-0"
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

export function FilterableColumn<TData, TType extends ColumnDataType, TVal>({
  column,
  setProperty,
}: {
  column: Column<TData, TType, TVal>
  setProperty: (value: string) => void
}) {
  const itemRef = useRef<HTMLDivElement>(null)

  const prefetch = useCallback(() => {
    column.prefetchOptions()
    column.prefetchValues()
    column.prefetchFacetedUniqueValues()
    column.prefetchFacetedMinMaxValues()
  }, [column])

  useEffect(() => {
    const target = itemRef.current

    if (!target) return

    // Set up MutationObserver
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const isSelected = target.getAttribute('data-selected') === 'true'
          if (isSelected) prefetch()
        }
      }
    })

    // Set up observer
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['data-selected'],
    })

    // Cleanup on unmount
    return () => observer.disconnect()
  }, [prefetch])

  return (
    <CommandItem
      ref={itemRef}
      value={column.id}
      keywords={[column.displayName]}
      onSelect={() => setProperty(column.id)}
      className="group"
      onMouseEnter={prefetch}
    >
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex items-center gap-1.5">
          {<column.icon strokeWidth={2.25} className="size-4" />}
          <span>{column.displayName}</span>
        </div>
        <ArrowRightIcon className="size-4 opacity-0 group-aria-selected:opacity-100" />
      </div>
    </CommandItem>
  )
}

interface QuickSearchFiltersProps {
  search?: string
}

export const QuickSearchFilters = memo(
  QuickSearchFilters__Internal,
) as typeof QuickSearchFilters__Internal

function QuickSearchFilters__Internal<TData>({ search }: QuickSearchFiltersProps) {
  const { filters, columns, actions } = useDataFilterContext<TData>()

  const cols = useMemo(
    () => columns.filter((c) => isAnyOf<ColumnDataType>(c.type, ['option', 'multiOption'])),
    [columns],
  )

  if (!search || search.trim().length < 2) return null

  return (
    <>
      {cols.map((column) => {
        const filter = filters.find((f) => f.columnId === column.id)
        const options = column.getOptions()
        const optionsCount = column.getFacetedUniqueValues()

        function handleOptionSelect(value: string, check: boolean) {
          if (check) actions.addFilterValue(column, [value])
          else actions.removeFilterValue(column, [value])
        }

        return (
          <React.Fragment key={column.id}>
            {options.map((v) => {
              const checked = Boolean(filter?.values.includes(v.value))
              const count = optionsCount?.get(v.value) ?? 0

              return (
                <CommandItem
                  key={v.value}
                  value={v.value}
                  keywords={[v.label, v.value]}
                  onSelect={() => {
                    handleOptionSelect(v.value, !checked)
                  }}
                  className="group"
                >
                  <div className="group flex items-center gap-1.5">
                    <Checkbox
                      checked={checked}
                      className="mr-1 opacity-0 data-[state=checked]:opacity-100 group-data-[selected=true]:opacity-100 dark:border-ring"
                    />
                    <div className="flex w-4 items-center justify-center">
                      {v.icon &&
                        (isValidElement(v.icon) ? (
                          v.icon
                        ) : (
                          <v.icon className="size-4 text-primary" />
                        ))}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-muted-foreground">{column.displayName}</span>
                      <ChevronRightIcon className="size-3.5 text-muted-foreground/75" />
                      <span>
                        {v.label}
                        <sup
                          className={cn(
                            !optionsCount && 'hidden',
                            'ml-0.5 text-muted-foreground tabular-nums tracking-tight',
                            count === 0 && 'slashed-zero',
                          )}
                        >
                          {count < 100 ? count : '100+'}
                        </sup>
                      </span>
                    </div>
                  </div>
                </CommandItem>
              )
            })}
          </React.Fragment>
        )
      })}
    </>
  )
}
