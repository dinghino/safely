'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@safely/backend/convex/_generated/api'
import type { Doc } from '@safely/backend/convex/_generated/dataModel'

import {
  createColumnHelper,
  DataTableProvider,
  type ColumnDef,
  DataTable,
  DataTableToolbar,
  useDataTable,
} from '@safely/data-table'
import dayjs from '@/lib/dayjs'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useIsCurrent } from '../hooks/use-is-current'
import { useIsActive } from '../hooks/use-is-active'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Device = Doc<'devices'> & { id: string }

const c = createColumnHelper<Device>()

const useDeviceColumns = () => {
  return useMemo(
    () =>
      [
        c.display({
          id: 'active',
          // header: 'Status',
          cell: (info) => <ActiveIndicator device={info.row.original} />,
          enableSorting: false,
        }),
        c.accessor('name', {
          header: 'Name',
          cell: (info) => {
            return (
              <div className="inline-flex items-center justify-between gap-2">
                {info.getValue() || <span className="text-muted-foreground">No name</span>}
                <CurrentIndicator device={info.row.original} />
              </div>
            )
          },
        }),
        c.accessor('deviceId', {
          header: 'Device ID',
          enableHiding: true,
          cell: (info) => <Badge>{info.getValue()}</Badge>,
        }),
        c.accessor('platform', {
          header: 'Platform',
          cell: (info) => info.getValue() || <span className="text-muted-foreground">Unknown</span>,
        }),
        c.accessor('last_seen', {
          header: 'Last Seen',
          cell: (info) => dayjs(info.getValue())?.fromNow(),
        }),
        c.display({
          id: 'actions',
          enableSorting: false,
          cell: (info) => (
            <div className="inline-flex w-full justify-end">
              <DeviceRowActions device={info.row.original} />
            </div>
          ),
        }),
      ] as ColumnDef<Device>[],
    [],
  )
}

export function DevicesTable() {
  const devices = useQuery(api.devices.getAll)
  const _unregister = useMutation(api.devices.deleteDevice)

  const columns = useDeviceColumns()

  const data = useMemo(() => devices?.map((d) => ({ ...d, id: d._id })) ?? [], [devices])
  if (!devices) return null

  return (
    <DataTableProvider
      columns={columns}
      data={data}
      initialState={{ columnVisibility: { deviceId: false } }}
    >
      <DataTableToolbar>
        <Toolbar />
      </DataTableToolbar>
      <DataTable />
    </DataTableProvider>
  )
}

const Toolbar = () => {
  const { table } = useDataTable()

  return <>{null}</>
}

function CurrentIndicator({ device }: { device: Device }) {
  const isCurrent = useIsCurrent({ device })
  if (!isCurrent) return null
  return <Badge variant={isCurrent ? 'default' : 'secondary'}>this device</Badge>
}

function ActiveIndicator({ device }: { device: Device }) {
  const active = useIsActive({ device })
  return (
    <Badge className={cn('aspect-square h-4 w-4 p-0', active ? 'bg-green-500' : 'bg-gray-500')} />
  )
}

function DeviceRowActions({ device }: { device: Device }) {
  const unregister = useMutation(api.devices.deleteDevice)
  // const local = useDeviceInfo()
  const isCurrent = useIsCurrent({ device })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isCurrent} onClick={() => unregister({ id: device._id })}>
          Unregister
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
