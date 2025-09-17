'use client'

import { flexRender } from '@tanstack/react-table'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from './components/column-header'
import { EmptyTableError } from './components/empty-table'
import { SimpleRow } from './components/simple-table-row'
import { useDataTable } from './data-table.context'

export namespace DataTable {
  export type Props<T extends { id: string | number }> = {
    /** Custom className for the table wrapper */
    className?: string
    /** Custom empty state message */
    emptyStateMessage?: string
    /** Whether to show row selection state */
    showSelection?: boolean
    children?: React.ReactNode
    /**
     * Custom row renderer. allows customizing the row component for various use
     * cases, such as drag-and-drop or custom styling.
     * @see {@link SimpleRow} for the default row component
     * @see {@link DraggableRow} for the dnd-kit compatible component
     * @default SimpleRow
     */
    renderRow?: React.ComponentType<SimpleRow.Props<T>>
  }
}

/**
 * Main visualization component for the data-table framework.
 * Interacts with the DataTableProvider to table configuration and render the table
 */
export function DataTable<T extends { id: string | number }>(props: DataTable.Props<T>) {
  const { className } = props

  return (
    <div className={cn('overflow-hidden', className)}>
      <Table className="border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <DataTableHeader />
        <tbody aria-hidden="true" className="table-row h-1" />
        <DataTableBody {...props} />
        <tbody aria-hidden="true" className="table-row h-1" />
      </Table>
    </div>
  )
}

export function DataTableHeader() {
  const { table } = useDataTable()
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead
                key={header.id}
                className="relative h-9 select-none border-border border-y bg-sidebar first:rounded-l-lg first:border-l first:pl-3 last:rounded-r-lg last:border-r last:pr-3"
              >
                {header.isPlaceholder ? null : typeof header.column.columnDef.header ===
                  'string' ? (
                  <DataTableColumnHeader
                    column={header.column}
                    title={header.column.columnDef.header}
                  />
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
}
type P<T extends { id: string | number }> = Pick<
  DataTable.Props<T>,
  'renderRow' | 'showSelection' | 'emptyStateMessage'
>
export function DataTableBody<T extends { id: string | number }>(props: P<T>) {
  const { renderRow: RenderRow = SimpleRow, showSelection = true, emptyStateMessage } = props
  const { table, loading } = useDataTable<T>()

  return (
    <TableBody className={cn()}>
      {table.getRowModel().rows?.length ? (
        table
          .getRowModel()
          .rows.map((row) => <RenderRow key={row.id} row={row} showSelection={showSelection} />)
      ) : loading ? (
        <LoadingRows />
      ) : (
        <EmptyTableError message={emptyStateMessage} />
      )}
    </TableBody>
  )
}

/**
 * Returns a set of loading rows for the table.
 * the number of rows depends on the pagination state,
 * columns from the table model are used to render the skeletons.
 */
function LoadingRows() {
  const { table } = useDataTable()
  const columns = table.getAllColumns()
  const rowCount = table.getState().pagination.pageSize || 5 // default to 5 rows if pageSize is not set

  const skeletons = Array.from({ length: rowCount }).map((_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: we don't know what else to use for now
    <TableRow key={index}>
      {columns.map((column) => (
        <TableCell key={column.id} className="p-0.5">
          <Skeleton className="h-[30px] min-w-[140px]" />
        </TableCell>
      ))}
    </TableRow>
  ))

  return <>{skeletons}</>
}
