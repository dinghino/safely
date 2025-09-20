import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'

import type { Column, ColumnDataType, FilterModel } from '../core/types'
import { getColumn } from '../lib/helpers'
import { FilterOperator } from './filter-operator'
import { FilterSubject } from './filter-subject'
import { FilterValue } from './filter-value'
import { useDataFilterContext } from './data-filter.context'

/**
 * Shows all active filters badges with internal controls
 */
export function ActiveFilters<TData>() {
  const { columns, filters } = useDataFilterContext<TData>()
  return (
    <>
      {filters.map((filter) => {
        const id = filter.columnId

        const column = getColumn(columns, id)

        // Skip if no filter value
        if (!filter.values) return null

        return (
          <ActiveFilter key={`active-filter-${filter.columnId}`} filter={filter} column={column} />
        )
      })}
    </>
  )
}

interface ActiveFilterProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
}

/**
 * Active filter badge-like control
 */
export function ActiveFilter<TData, TType extends ColumnDataType>(
  props: ActiveFilterProps<TData, TType>,
) {
  const { filter, column } = props
  const { actions } = useDataFilterContext<TData>()

  return (
    <div className="flex h-7 items-center rounded-2xl border border-border bg-background text-xs shadow-xs">
      <FilterSubject column={column} />
      <Separator orientation="vertical" />
      <FilterOperator filter={filter} column={column} />
      <Separator orientation="vertical" />
      <FilterValue filter={filter} column={column} />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        className="h-full w-7 rounded-none rounded-r-2xl text-xs"
        onClick={() => actions.removeFilter(filter.columnId)}
      >
        <X className="-translate-x-0.5 size-4" />
      </Button>
    </div>
  )
}

/**
 * Horizontal ScrollArea like element with conditional shadows on the sides if
 * there is content hidden in the scrollable area.
 * @todo extract into @/components/scrollable-area or directly refactor the
 *       @workspace/ui/components/scroll-area to support this behavior conditionally
 */
export function ActiveFiltersMobileContainer({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(true)

  // Check if there's content to scroll and update blur states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0)

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  // Log blur states for debugging
  // useEffect(() => {
  //   console.log('left:', showLeftBlur, '  right:', showRightBlur)
  // }, [showLeftBlur, showRightBlur])

  // Set up ResizeObserver to monitor container size
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll()
      })
      resizeObserver.observe(scrollContainerRef.current)
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Update blur states when children change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    checkScroll()
  }, [children])

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Left blur effect */}
      {showLeftBlur && (
        <div className="from-background animate-in fade-in-0 pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex gap-2 overflow-x-scroll"
        onScroll={checkScroll}
      >
        {children}
      </div>

      {/* Right blur effect */}
      {showRightBlur && (
        <div className="from-background animate-in fade-in-0 pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l to-transparent" />
      )}
    </div>
  )
}
