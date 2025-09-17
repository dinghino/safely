'use client'

import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@/lib/utils'

export namespace DragHandle {
  export type Props = {
    id: UniqueIdentifier
  } & Omit<React.ComponentProps<typeof Button>, 'children' | 'id'>
}

export function DragHandle(props: DragHandle.Props) {
  const { id, className, ...rest } = props
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      variant="ghost"
      size="icon"
      {...rest}
      {...attributes}
      {...listeners}
      className={cn(
        'size-7 cursor-grab rounded-sm text-muted-foreground active:cursor-grabbing',
        className,
      )}
    >
      <GripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}
