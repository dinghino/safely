import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { UniqueIdentifier } from '@dnd-kit/core'

import { DragHandle } from './drag-handle'
import { cn } from '@/lib/utils'

export namespace SortableListItem {
  export type Props = {
    id: UniqueIdentifier
    children: React.ReactNode
    className?: string
  }
}

/**
 * List item for {@link SortableList}. Takes in a children that represents the
 * content of the list as is and renders it with a drag handle on the left.
 *
 * @note if you need to customize the children style based on the dragging state
 * you can add a `group` class to the parent and use the `group-data-[dragging=true]:your-class`
 * to target the children.
 * @example
 * ```tsx
 * <SortableListItem id={item.id} className="group">
 *  <YourComponent className="group-data-[dragging=true]:shadow-2xl" />
 * </SortableListItem>
 * ```
 */
export function SortableListItem(props: SortableListItem.Props) {
  const { id, children, className } = props
  const { setNodeRef, transform, transition, isOver, isDragging } = useSortable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      data-over={isOver}
      data-dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex flex-row items-center gap-2',
        className,
        // dragging styles by default we only z-index up the dragged item
        // from props we can give whatever we want.
        // by default we should target the children and not the list item
        'data-[dragging=true]:z-10',
      )}
    >
      <DragHandle id={id} className="w-8" />
      {children}
    </div>
  )
}
