'use client'

import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area'
import { ClearFiltersButton } from './controls/clear-filter-button'
import { DataTableColumnToggle } from './controls/column-toggle'

export namespace DataTableToolbar {
  export type Props = {
    /** Left-side content (usually search/filters) */
    children?: React.ReactNode
    /** Right-side actions */
    actions?: React.ReactNode
    /** classname for the internal wrapper */
    className?: string
    /** Custom column toggle props */
    columnToggle?: {
      label?: string
      hideLabel?: boolean
    }
    /**
     * if true it shows a clear filters button
     * This is for legacy behavior without using the `DataFilter` system
     * that has its own ui to clear filters
     */
    showClear?: boolean
  }
}

export function DataTableToolbar(props: DataTableToolbar.Props) {
  const { children, actions, columnToggle, className, showClear = true } = props
  return (
    <ScrollArea className="pb-2">
      <div className={cn('@container/toolbar flex items-center justify-between gap-2', className)}>
        <div className="flex flex-1 items-center space-x-2">
          {children}
          {showClear && <ClearFiltersButton />}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          <DataTableColumnToggle {...columnToggle} />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
