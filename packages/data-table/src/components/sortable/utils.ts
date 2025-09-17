import { arrayMove } from '@dnd-kit/sortable'
import type { SortableItem } from './types'
import type { Active, Over, UniqueIdentifier } from '@dnd-kit/core'

type ReorderItemsOptions<T extends SortableItem> = {
  data: T[]
  dataIds: UniqueIdentifier[]
  active: Active | null
  over: Over | null
}

type ReorderReturn<T extends SortableItem> = [data: T[], ordered: boolean]

export function reorderItems<T extends SortableItem>(
  opts: ReorderItemsOptions<T>,
): ReorderReturn<T> {
  const { data, active, dataIds, over } = opts

  if (!active || !over) return [data, false]
  if (active.id === over.id) return [data, false]

  const oldIndex = dataIds.indexOf(active.id)
  const newIndex = dataIds.indexOf(over.id)
  // do we need this?
  if (oldIndex === -1 || newIndex === -1) return [data, false]

  return [arrayMove(data, oldIndex, newIndex), true]
}
