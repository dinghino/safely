'use client'

import { CircleAlert, Loader2, Trash } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDataTable } from '../data-table.context'
import { useTransition } from 'react'

type WithId = { id: string | number }

export namespace BulkDeleteButton {
  export type Props<T extends WithId> = {
    // table: Table<T>
    onConfirm: (rows: T[]) => Promise<void>
    /**
     * If true the button will not show if the table has no selected rows
     * @default true
     */
    dynamic?: boolean
    disabled?: boolean
  }
}

export function BulkDeleteButton<T extends WithId>(props: BulkDeleteButton.Props<T>) {
  const { onConfirm: handleDeleteRows, dynamic = true, disabled } = props

  const { table } = useDataTable<T>()
  const [isPending, startTransition] = useTransition()

  if (dynamic && !table.getSelectedRowModel().rows.length) return null

  const handleDelete = () => {
    const rows = table.getSelectedRowModel().rows.map((row) => row.original)
    startTransition(async () => {
      await handleDeleteRows(rows)
      table.resetRowSelection()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending || disabled}>
        <Button className="" variant="outline" disabled={isPending || disabled}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Trash className="-ms-1 size-4 opacity-60" aria-hidden="true" />
          )}
          <span className="text-xs @max-lg:hidden">Delete</span>
          <Badge className="aspect-square p-1 font-mono text-xs">
            {table.getSelectedRowModel().rows.length}
          </Badge>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="border-border flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlert className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {table.getSelectedRowModel().rows.length} selected{' '}
              {table.getSelectedRowModel().rows.length === 1 ? 'row' : 'rows'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
