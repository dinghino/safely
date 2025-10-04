'use client'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortableContext } from './sortable.context'

export namespace SortableList {
  export type Props = {
    children: React.ReactNode
  }
}

/**
 * Lightweight wrapper around the dnd-kit SortableContext, set up for
 * vertical list sorting.
 * @see {@link Sortable}
 */
export function SortableList(props: SortableList.Props) {
  const { dataIds } = useSortableContext()

  return (
    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
      {props.children}
    </SortableContext>
  )
}
