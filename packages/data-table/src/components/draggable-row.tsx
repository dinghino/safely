'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { UniqueIdentifier } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import { SimpleRow } from './simple-table-row'

export namespace DraggableRow {
  export type Props<T extends { id: UniqueIdentifier }> = SimpleRow.Props<T>
}

/**
 * Default extractor assumes an `id` property in the row's original data.
 * This is a common pattern, but you can customize it by passing a different
 */

export function DraggableRow<T extends { id: UniqueIdentifier }>(props: DraggableRow.Props<T>) {
  const { row } = props

  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <SimpleRow
      {...props}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        'relative z-0 transition-opacity duration-150 ease-linear data-[dragging=true]:z-10 data-[dragging=true]:opacity-10',
        // expecting first cell to be the drag handle, we set fixed size
        '*:data-[slot=table-cell]:first:w-8',
        props.className,
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    />
  )
}
