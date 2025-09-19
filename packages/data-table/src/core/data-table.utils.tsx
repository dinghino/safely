import type { UniqueIdentifier } from '@dnd-kit/core/dist/types'
import type { ColumnDef } from '@tanstack/react-table'

import { DragHandle } from '../components/sortable/drag-handle'
import { Checkbox } from '@workspace/ui/components/checkbox'

export function dragHandleColumn<T extends { id: UniqueIdentifier }>() {
  return [
    {
      id: '__drag',
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      size: 32,
      enableSorting: false,
      enableHiding: false,
    },
  ] satisfies ColumnDef<T>[]
}

/**
 * Adds a select column to the table, with headers for bulk selection.
 */
export function selectColumn<T extends object>(): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  }
}
