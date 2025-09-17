'use client'

import { useState, useEffect } from 'react'
import type { Column } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'

import { useDebounce } from '@workspace/react-utils'

import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@/lib/utils'

export namespace DataTableSearchFilter {
  export type Props<T extends object> = {
    column?: Column<T, unknown>
    placeholder?: string
    className?: string
    /** Debounce delay in milliseconds */
    debounce?: number
    /** Show search icon */
    showIcon?: boolean
    /** Show clear button */
    showClear?: boolean
  }
}
/**
 * Client side search filter for data tables.
 * This works by filtering directly the dataset available in the table for now,
 * so it is not suitable for large datasets.
 */
export function DataTableSearchFilter<T extends object>(props: DataTableSearchFilter.Props<T>) {
  const {
    column,
    placeholder = 'Filter...',
    className,
    debounce = 300,
    showIcon = true,
    showClear = true,
  } = props

  const [value, setValue] = useState((column?.getFilterValue() as string) ?? '')
  const debouncedValue = useDebounce(value, debounce)

  useEffect(() => column?.setFilterValue(debouncedValue), [debouncedValue, column])

  // reset when we hard reset the column filters from outside
  const fromTable = column?.getFilterValue() as string
  useEffect(() => setValue(fromTable ?? ''), [fromTable])

  // local clear + dispatch for column filter
  const handleClear = () => {
    setValue('')
    column?.setFilterValue('')
  }

  return (
    <div className="relative flex items-center">
      {showIcon && <Search className="text-muted-foreground absolute left-3 h-4 w-4" />}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={cn('h-8 text-sm', showIcon && 'pl-9', showClear && value && 'pr-9', className)}
      />
      {showClear && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
