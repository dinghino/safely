import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'

import { useDataTable } from '../data-table.context'
import { EmptyTableIcon } from './empty-table-icon'

export namespace EmptyTableError {
  export type Props = {
    actions?: { removeAllFilters?: () => void }
    message?: string
  }
}

export const EmptyTableError = (props: EmptyTableError.Props) => {
  const { actions, message = 'No issues matching your filters.' } = props
  const { table } = useDataTable()
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={table.getAllColumns().length} className="h-[calc(var(--spacing)*12*10)]">
        <div className="flex flex-col items-center justify-center gap-8">
          <EmptyTableIcon className="size-24 stroke-muted-foreground" />
          <div className="flex flex-col gap-4 text-center font-[450]">
            <span>{message}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Adjust or clear filters to reveal issues.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn('gap-1', !actions && 'hidden')}
                onClick={actions?.removeAllFilters}
              >
                <XIcon className="text-muted-foreground" />
                Clear filters
              </Button>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
