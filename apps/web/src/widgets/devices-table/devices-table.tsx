'use client'

import { useMemo } from 'react'
import { useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'

import {
  DataTable,
  DataTableColumnToggle,
  DataTableProvider,
  DataTableToolbar,
} from '@workspace/data-table'

import {
  ActiveFilters,
  ActiveFiltersMobileContainer,
  createTSTColumns,
  createTSTFilters,
  DataFilter,
  FilterActions,
  FilterSelector,
  useDataTableFilters,
  useFilterSearchParams,
} from '@workspace/data-filter'
import { useDebounceCallback } from '@workspace/data-filter/hooks'

import { RegisterDeviceButton } from '@/features/device-manager'
import { getDeviceFilters, getColumns } from './devices-table.config'

export namespace DevicesTable {
  export type Props = {
    deviceBaseUrl?: string
  }
}

export function DevicesTable(props: DevicesTable.Props) {
  const { deviceBaseUrl = '/dashboard/devices' } = props
  const [filterState, setFilterState] = useQueryFilters()

  // todo: pass filters (and pagination) down when we allow filtering on backend
  const data = useDevicesData()

  const columns = useMemo(() => getColumns({ deviceBaseUrl }), [deviceBaseUrl])
  const columnsConfig = useMemo(() => getDeviceFilters(), [])

  const filter = useDataTableFilters({
    data,
    columnsConfig,
    strategy: 'client',
    filters: filterState,
    onFiltersChange: setFilterState,
    options: {
      status: [
        { label: 'Offline', value: 'offline' },
        { label: 'Online', value: 'online' },
      ],
      mode: [
        { label: 'Off', value: 'off' },
        { label: 'Passive', value: 'passive' },
        { label: 'Active', value: 'active' },
        { label: 'Aggressive', value: 'aggressive' },
      ],
    },
  })

  const tstColumns = useMemo(
    () => createTSTColumns({ columns, configs: filter.columns }),
    [columns, filter.columns],
  )

  const filters = useMemo(() => createTSTFilters(filter.filters), [filter.filters])

  return (
    <DataTableProvider
      columns={tstColumns}
      data={data}
      filters={filters}
      initialState={{ columnVisibility: { deviceId: false, platform: false } }}
    >
      <div className="space-y-2">
        <DataFilter {...filter}>
          <DataTableToolbar
            actions={
              <>
                <RegisterDeviceButton size="sm" className="" />
                <DataTableColumnToggle />
              </>
            }
          >
            <FilterSelector />
            <FilterActions />
            {/* <DataTableFilter {...filter} /> */}
          </DataTableToolbar>
          <ActiveFiltersMobileContainer>
            <ActiveFilters />
          </ActiveFiltersMobileContainer>
        </DataFilter>
        <DataTable />
      </div>
    </DataTableProvider>
  )
}

function useDevicesData() {
  const devices = useQuery(api.devices.get.all)
  // data-table expects an 'id' field for now, so we map it here
  // todo: refactor data-table to allow custom id field
  return useMemo(() => devices?.map((d) => ({ ...d, id: d._id as string })) ?? [], [devices])
}

function useQueryFilters() {
  const [filterState, _setFilterState] = useFilterSearchParams({
    key: 'devices',
  })
  const setFilterState = useDebounceCallback(_setFilterState, 300)
  return [filterState, setFilterState] as const
}
