'use client'

import { useMutation, useQuery } from 'convex/react'
import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import dayjs from '@/lib/dayjs'

import { api } from '@workspace/backend/api'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import {
  type ColumnDef,
  createColumnHelper,
  DataTable,
  DataTableProvider,
  DataTableToolbar,
} from '@workspace/data-table'
import { useIsCurrent } from '../hooks/use-is-current'

import type { Device } from '@/entities/device/types'
import { DeviceName, DevicePlatform, DeviceStatusBadge } from '@/entities/device/components'
import { DeviceForm } from './device-form'
import { DevicePositionManager } from './position-manager'
import Link from 'next/link'

type DeviceWithId = Device & { id: string }

const c = createColumnHelper<DeviceWithId>()

const useDeviceColumns = ({ deviceBaseUrl }: { deviceBaseUrl: string }) => {
  return useMemo(
    () =>
      [
        c.display({
          id: 'active',
          header: 'Status',
          cell: ({ row }) => <DeviceStatusBadge device={row.original} />,
          enableSorting: false,
        }),
        c.accessor('name', {
          id: 'name',
          header: 'Device',
          cell: ({ row }) => {
            const href = `${deviceBaseUrl}/${row.original.deviceId}`
            return (
              // @ts-ignore href is broken?
              <Link href={href}>
                <DeviceName device={row.original} />
              </Link>
            )
          },
        }),
        c.accessor('deviceId', {
          id: 'deviceId',
          header: 'Device ID',
          enableHiding: true,
          maxSize: 120,
          size: 120,
          minSize: 120,
          cell: (info) => (
            <Badge variant="secondary" className="font-mono">
              {info.getValue()}
            </Badge>
          ),
        }),
        c.accessor('platform', {
          id: 'platform',
          header: 'Platform',
          cell: ({ row }) => <DevicePlatform device={row.original} />,
        }),
        c.accessor('last_seen', {
          id: 'last_seen',
          header: 'Last Seen',
          cell: ({ cell }) => dayjs(cell.getValue())?.fromNow(),
        }),
        c.display({
          id: 'actions',
          enableSorting: false,
          cell: ({ row }) => <ActionsCell device={row.original} />,
        }),
      ] as ColumnDef<DeviceWithId>[],
    [deviceBaseUrl],
  )
}

export namespace DevicesTable {
  export type Props = {
    deviceBaseUrl?: string
  }
}

export function DevicesTable(props: DevicesTable.Props) {
  const { deviceBaseUrl = '/dashboard/devices' } = props
  const devices = useQuery(api.devices.getAll)
  const _unregister = useMutation(api.devices.deleteDevice)

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

function ActionsCell({ device }: { device: Device }) {
  const isCurrent = useIsCurrent({ device })

  return (
    <div className="inline-flex w-full justify-end gap-1">
      {isCurrent && <DevicePositionManager device={device} />}
      <DeviceRowActions device={device} />
    </div>
  )
}

function DeviceRowActions({ device }: { device: Device }) {
  const unregister = useMutation(api.devices.deleteDevice)
  const isCurrent = useIsCurrent({ device })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isCurrent} onClick={() => unregister({ id: device._id })}>
          Unregister
        </DropdownMenuItem>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Rename</DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Device</DialogTitle>
              <DialogDescription>Enter a new name for your device.</DialogDescription>
            </DialogHeader>
            <DeviceForm device={device} />
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
