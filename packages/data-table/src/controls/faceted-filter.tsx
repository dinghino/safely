import type { Column } from '@tanstack/react-table'
import { FacetedFilter } from '../components/faceted-filter'

export namespace DataTableFacetedFilter {
  export type Props<TData, TValue> = Omit<
    FacetedFilter.Props,
    'facets' | 'onSelect' | 'onClear' | 'active'
  > & {
    /** table column to filter */
    column?: Column<TData, TValue>
    // compliance with SelectFilter until we refactor consumers
    className?: string
    showClear?: boolean
    placeholder?: string
  }
}
/**
 * Data table filter with facets. needs to be wrapped in a data table context.
 * @deprecated use @/modules/data-filter api instead
 */
export function DataTableFacetedFilter<TData, TValue>(
  props: DataTableFacetedFilter.Props<TData, TValue>,
) {
  const { column, title, loading, options } = props

  const selectedValues = new Set(column?.getFilterValue() as string[])
  const facets = column?.getFacetedUniqueValues()
  const clearFilters = () => column?.setFilterValue(undefined)

  const handleSelect = (value: string) => {
    const isSelected = selectedValues.has(value)
    if (isSelected) {
      selectedValues.delete(value)
    } else {
      selectedValues.add(value)
    }
    const filterValues = Array.from(selectedValues)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
  }

  return (
    <FacetedFilter
      title={title ?? 'Filter'}
      facets={facets}
      options={options}
      loading={loading}
      max={props.max ?? 3}
      active={selectedValues}
      onSelect={handleSelect}
      onClear={clearFilters}
    />
  )
}
