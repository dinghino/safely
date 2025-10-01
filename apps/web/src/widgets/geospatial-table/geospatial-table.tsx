'use client'

import { useMemo } from 'react'
import type { SessionLocation } from './types'
import { getColumns } from './geospatial-table.config'
import { DataTable, DataTablePagination, DataTableProvider } from '@workspace/data-table'

export namespace SessionLocationsTable {
  export type Props = {
    locations: Omit<SessionLocation, 'id'>[]
  }
}

export function SessionLocationsTable({ locations }: SessionLocationsTable.Props) {
  const columns = useMemo(() => getColumns(), [])
  const data = useMemo(() => locations.map((l) => ({ ...l, id: l._id as string })), [locations])

  return (
    <DataTableProvider data={data} columns={columns}>
      <div className="space-y-2">
        <div className="rounded-lg bg-card">
          <DataTable />
        </div>
        {/* <div className="rounded-lg bg-card py-2"> */}
        <DataTablePagination pageSizeOptions={[10, 20, 30, 50, 100, 200]} />
        {/* </div> */}
      </div>
    </DataTableProvider>
  )
}
