import { useState } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'

import {
  dateFilterOperators,
  filterTypeOperatorDetails,
  multiOptionFilterOperators,
  numberFilterOperators,
  optionFilterOperators,
  textFilterOperators,
} from '../core/operators'

import type { Column, ColumnDataType, FilterModel, FilterOperators } from '../core/types'
import { t } from '../lib/i18n'
import { useDataFilterContext } from './data-filter.context'

interface FilterOperatorProps<TData, TType extends ColumnDataType> {
  column: Column<TData, TType>
  filter: FilterModel<TType>
}

/**
 * Renders the filter operator display and menu for a given column filter
 * - `FilterOperatorDisplay` is the label and icon for the filter operator
 * - `FilterOperatorMenu` is the dropdown menu for the filter operator
 * @see {@link FilterOperatorDisplay}
 * @see {@link FilterOperatorMenu}
 */
export function FilterOperator<TData, TType extends ColumnDataType>(
  props: FilterOperatorProps<TData, TType>,
) {
  const { column, filter } = props
  const { locale } = useDataFilterContext<TData>()

  const [open, setOpen] = useState<boolean>(false)

  const close = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit rounded-none p-0 px-2 text-xs whitespace-nowrap"
        >
          <FilterOperatorDisplay filter={filter} columnType={column.type} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-fit origin-(--radix-popover-content-transform-origin) p-0"
      >
        <Command loop>
          <CommandInput placeholder={t('search', locale)} />
          <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
          <CommandList className="max-h-fit">
            <FilterOperatorController filter={filter} column={column} closeController={close} />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface FilterOperatorDisplayProps<TType extends ColumnDataType> {
  filter: FilterModel<TType>
  columnType: TType
}

export function FilterOperatorDisplay<TType extends ColumnDataType>({
  filter,
  columnType,
}: FilterOperatorDisplayProps<TType>) {
  const { locale } = useDataFilterContext()

  const operator = filterTypeOperatorDetails[columnType][filter.operator]
  const label = t(operator.key, locale)

  return <span className="text-muted-foreground">{label}</span>
}

interface FilterOperatorControllerProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  closeController: () => void
}

/*
 *
 * TODO: Reduce into a single component. Each data type does not need it's own controller.
 *
 */
export function FilterOperatorController<TData, TType extends ColumnDataType>(
  props: FilterOperatorControllerProps<TData, TType>,
) {
  const { filter, column, closeController } = props

  switch (column.type) {
    case 'option':
      return (
        <FilterOperatorOptionController
          filter={filter as FilterModel<'option'>}
          column={column as Column<TData, 'option'>}
          closeController={closeController}
        />
      )
    case 'multiOption':
      return (
        <FilterOperatorMultiOptionController
          filter={filter as FilterModel<'multiOption'>}
          column={column as Column<TData, 'multiOption'>}
          closeController={closeController}
        />
      )
    case 'date':
      return (
        <FilterOperatorDateController
          filter={filter as FilterModel<'date'>}
          column={column as Column<TData, 'date'>}
          closeController={closeController}
        />
      )
    case 'text':
      return (
        <FilterOperatorTextController
          filter={filter as FilterModel<'text'>}
          column={column as Column<TData, 'text'>}
          closeController={closeController}
        />
      )
    case 'number':
      return (
        <FilterOperatorNumberController
          filter={filter as FilterModel<'number'>}
          column={column as Column<TData, 'number'>}
          closeController={closeController}
        />
      )
    default:
      return null
  }
}

function FilterOperatorOptionController<TData>(
  props: FilterOperatorControllerProps<TData, 'option'>,
) {
  const { filter, column, closeController } = props
  const { actions, locale } = useDataFilterContext<TData>()
  const filterDetails = optionFilterOperators[filter.operator]

  const relatedFilters = Object.values(optionFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['option'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorMultiOptionController<TData>(
  props: FilterOperatorControllerProps<TData, 'multiOption'>,
) {
  const { filter, column, closeController } = props
  const { actions, locale } = useDataFilterContext<TData>()
  const filterDetails = multiOptionFilterOperators[filter.operator]

  const relatedFilters = Object.values(multiOptionFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['multiOption'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorDateController<TData>(props: FilterOperatorControllerProps<TData, 'date'>) {
  const { filter, column, closeController } = props
  const { actions, locale } = useDataFilterContext<TData>()

  const filterDetails = dateFilterOperators[filter.operator]

  const relatedFilters = Object.values(dateFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['date'])
    closeController()
  }

  return (
    <CommandGroup>
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

export function FilterOperatorTextController<TData>(
  props: FilterOperatorControllerProps<TData, 'text'>,
) {
  const { filter, column, closeController } = props
  const { actions, locale } = useDataFilterContext<TData>()

  const filterDetails = textFilterOperators[filter.operator]

  const relatedFilters = Object.values(textFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['text'])
    closeController()
  }

  return (
    <CommandGroup heading={t('operators', locale)}>
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}

function FilterOperatorNumberController<TData>(
  props: FilterOperatorControllerProps<TData, 'number'>,
) {
  const { filter, column, closeController } = props
  const { actions, locale } = useDataFilterContext<TData>()

  const filterDetails = numberFilterOperators[filter.operator]

  const relatedFilters = Object.values(numberFilterOperators).filter(
    (o) => o.target === filterDetails.target,
  )

  const changeOperator = (value: string) => {
    actions?.setFilterOperator(column.id, value as FilterOperators['number'])
    closeController()
  }

  return (
    <div>
      <CommandGroup heading={t('operators', locale)}>
        {relatedFilters.map((r) => (
          <CommandItem onSelect={() => changeOperator(r.value)} value={r.value} key={r.value}>
            {t(r.key, locale)}
          </CommandItem>
        ))}
      </CommandGroup>
    </div>
  )
}
