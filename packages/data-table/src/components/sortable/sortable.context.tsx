'use client'
import { isValidElement, useEffect, useId, useMemo, useState } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  type UniqueIdentifier,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import { createContext } from '@safely/react-utils'
import type { DragEndEventHandler, SortableItem } from './types'
import { reorderItems } from './utils'

export namespace Sortable {
  export type Props<T extends SortableItem> = {
    children: React.ReactNode | ((props: { data: T[] }) => React.ReactNode)
    data: T[]
    onDragEnd?: DragEndEventHandler<T>
  }
  export type Context = {
    dataIds: UniqueIdentifier[]
  }
}

/**
 * Internal context to share data related information between dnd-kit components.
 */
const [SortableProvider, useSortableContext] = createContext<Sortable.Context>(
  'DataTable_SortableContext',
)

export { useSortableContext }

/**
 * A light wrapper around the DndContext to provide functional sorting capabilities
 * to a list of items with an `id` property.
 * Exposes the `dataIds` context to child components.
 */
export function Sortable<T extends SortableItem>(props: Sortable.Props<T>) {
  const { children, data: initialData, onDragEnd } = props
  const sortableId = useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )
  const [data, setData] = useState<T[]>(() => initialData)
  // refresh the data when the incoming data changes, either with the modified
  // data from the onDragEnd call or reset because it failed
  useEffect(() => setData(initialData), [initialData])

  // keep track of the IDs of the actual items in the data array
  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const [ordered, done] = reorderItems({ data, dataIds, active, over })
    if (!done) return
    setData(ordered)
    onDragEnd?.(ordered, event)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      id={sortableId}
    >
      <SortableProvider value={{ dataIds }}>
        {/* {children} */}
        {isValidElement(children)
          ? children
          : typeof children === 'function'
            ? children({ data })
            : null}
      </SortableProvider>
    </DndContext>
  )
}
