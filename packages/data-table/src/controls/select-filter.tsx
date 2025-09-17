'use client'

import type { Column } from '@tanstack/react-table'
import { type IconName, DynamicIcon } from 'lucide-react/dynamic'
import { Loader, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export namespace DataTableSelectFilter {
  export type Props<T extends object> = {
    column?: Column<T, unknown>
    title?: string
    options: Array<{
      label: string
      value: string
      icon?: IconName | (string & {}) | null
    }>
    className?: string
    /** Show clear button */
    showClear?: boolean
    /** Placeholder text */
    placeholder?: string
    /** for async lists, disables the input and shows a loading spinner */
    loading?: boolean
  }
}

/**
 * Client side select filter for data tables.
 * This works by filtering directly the dataset available in the table for now,
 * so it is not suitable for large datasets.
 * @deprecated use {@link DataTableFacetedFilter} instead
 */
export function DataTableSelectFilter<T extends object>(props: DataTableSelectFilter.Props<T>) {
  const { column, title, options, className, showClear = true, placeholder, loading } = props
  const currentValue = new Set(column?.getFilterValue() as string[])

  const handleClear = () => {
    column?.setFilterValue([])
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentValue?.values().next().value}
        disabled={loading}
        onValueChange={(value) => column?.setFilterValue(value === 'all' ? [] : [value])}
      >
        <SelectTrigger className={className} size="sm" disabled={loading}>
          {loading ? (
            <p className="space-x-1 text-xs">
              <Loader className="inline animate-spin" />
              <span>{title}</span>
            </p>
          ) : (
            <SelectValue placeholder={placeholder || title} />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {title}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {/* {option.icon && <option.icon className="h-4 w-4" />} */}
                {option.icon && <DynamicIcon name={option.icon as IconName} className="h-4 w-4" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showClear && currentValue && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
