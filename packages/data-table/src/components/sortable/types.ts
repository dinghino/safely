import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'

export type SortableItem<T extends object = object> = T & { id: UniqueIdentifier }

export type DragEndEventHandler<T extends SortableItem = SortableItem> = (
  sorted: T[],
  event: DragEndEvent,
) => void
