import { flexRender, type Row } from '@tanstack/react-table'
import { TableCell, TableRow as TableRowPrimitive } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export namespace SimpleRow {
  export type Props<T extends object> = {
    row: Row<T>
    showSelection: boolean
  } & Omit<React.ComponentProps<typeof TableRowPrimitive>, 'children'>
}

export function SimpleRow<T extends object>(props: SimpleRow.Props<T>) {
  const { row, showSelection, className, ...rest } = props

  // console.log('🍎 simple row render', row.id)

  return (
    <TableRowPrimitive
      data-state={showSelection && row.getIsSelected() && 'selected'}
      {...rest}
      className={cn(
        'h-px border-0 hover:bg-accent/50',
        '[&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
        className,
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRowPrimitive>
  )
}
