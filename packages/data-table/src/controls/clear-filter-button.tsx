'use client'

import { XIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useDataTable } from '../core'

export function ClearFiltersButton() {
  const { table } = useDataTable()
  const isFiltered = table.getState().columnFilters.length > 0

  if (!isFiltered) return null

  return (
    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
      <span className="@max-lg:hidden">Reset</span>
      <XIcon className="h-4 w-4" />
    </Button>
  )
}
