'use client'

import { useMemo } from 'react'
import { useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'

import { DataTable, DataTableProvider, DataTableToolbar } from '@workspace/data-table'

import { useDeviceColumns } from './devices-table.config'

export namespace DevicesTable {
  export type Props = {
    deviceBaseUrl?: string
  }
}

export function DevicesTable(props: DevicesTable.Props) {
  const { deviceBaseUrl = '/dashboard/devices' } = props
  const devices = useQuery(api.devices.getAll)
  const columns = useDeviceColumns({ deviceBaseUrl })

  // data-table expects an 'id' field for now
  const data = useMemo(() => devices?.map((d) => ({ ...d, id: d._id })) ?? [], [devices])

  return (
    <DataTableProvider
      columns={columns}
      data={data}
      initialState={{ columnVisibility: { deviceId: false } }}
    >
      <div className="space-y-2">
        <DataTableToolbar>
          <Toolbar />
        </DataTableToolbar>
        <DataTable />
      </div>
    </DataTableProvider>
  )
}

const Toolbar = () => {
  // const { table } = useDataTable()
  return <span className="w-full rounded border bg-background px-2 py-1">Toolbar goes here</span>
}
