'use client'

import { api } from '@workspace/backend/convex/_generated/api'
import type { Doc } from '@workspace/backend/convex/_generated/dataModel'
import {
  type ColumnDef,
  createColumnHelper,
  DataTable,
  DataTableProvider,
  DataTableToolbar,
} from '@workspace/data-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useMutation, useQuery } from 'convex/react'
import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import { useIsActive } from '../hooks/use-is-active'
import { useIsCurrent } from '../hooks/use-is-current'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'

type Device = Doc<'devices'> & { id: string }

const c = createColumnHelper<Device>()

const useDeviceColumns = () => {
  return useMemo(
    () =>
      [
        c.display({
          id: 'active',
          header: 'Status',
          cell: ({ row }) => <ActiveIndicator device={row.original} />,
          enableSorting: false,
        }),
        c.accessor('name', {
          id: 'name',
          header: 'Device',
          cell: ({ row }) => <DeviceName device={row.original} />,
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
          cell: ({ row }) => (
            <div className="inline-flex w-full justify-end">
              <DeviceRowActions device={row.original} />
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

function DeviceName({ device }: { device: Device }) {
  const isCurrent = useIsCurrent({ device })
  const name = device.name ?? 'Unknown device'
  const hasName = Boolean(device.name)
  return (
    <div className="inline-flex w-full items-center justify-between gap-2">
      {/* <ActiveIndicator device={device} /> */}
      <span className={cn(!hasName && 'text-muted-foreground', isCurrent && 'font-bold')}>
        {name}
      </span>
      {/* <CurrentIndicator device={row.original} /> */}
    </div>
  )
}

function DevicePlatform({ device }: { device: Device }) {
  const platform = device.platform ?? 'Unknown platform'
  const hasPlatform = Boolean(device.platform)
  return <span className={cn(!hasPlatform && 'text-muted-foreground')}>{platform}</span>
}

function ActiveIndicator({ device }: { device: Device }) {
  const active = useIsActive({ device })
  return (
    <Badge
      variant="secondary"
      className={cn('max-md:aspect-square', active ? 'text-green-500' : 'text-gray-500')}
    >
      <span className={cn('h-2 w-2 rounded-full', active ? 'bg-green-500' : 'bg-gray-500')} />
      <span className="max-md:sr-only">{active ? 'Online' : 'Offline'}</span>
    </Badge>
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
            <RenameForm device={device} />
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RenameForm({ device }: { device: Device }) {
  const rename = useMutation(api.devices.renameDevice)
  return (
    <form
      className="mt-4 flex w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get('name') as string
        rename({ deviceId: device._id, name })
      }}
    >
      <Input name="name" defaultValue={device.name} placeholder="Enter new device name" />
      <Button type="submit">Rename</Button>
    </form>
  )
}
