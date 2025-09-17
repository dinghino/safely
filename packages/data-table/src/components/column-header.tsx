'use client'

import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export namespace DataTableColumnHeader {
  export type Props<T extends object> = {
    column: Column<T, unknown>
    title: string
    className?: string
  }
}

export function DataTableColumnHeader<T extends object>({
  column,
  title,
  className,
}: DataTableColumnHeader.Props<T>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted()
    if (currentSort === false) {
      column.toggleSorting(false) // Set to asc
    } else if (currentSort === 'asc') {
      column.toggleSorting(true) // Set to desc
    } else {
      column.clearSorting() // Clear sorting
    }
  }

  return (
    <div className={cn('flex items-center space-x-1 p-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={handleSort}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
