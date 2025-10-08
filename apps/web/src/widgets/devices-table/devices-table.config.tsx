'use client'

import Link from 'next/link'
import { BellIcon, MapPinIcon, Monitor } from 'lucide-react'

import dayjs from '@/lib/dayjs'

import { Badge } from '@workspace/ui/components/badge'
import { createColumnHelper } from '@workspace/data-table'
import { createColumnConfigHelper } from '@workspace/data-filter'

import type { Device } from '@/entities/device/types'
import { DeviceName, DevicePlatform, DeviceStatusBadge } from '@/entities/device/components'

import { DeviceActionsMenu } from '@/features/device-manager/components'
import { SessionButton } from '@/features/device-tracking/components'

export type DeviceWithId = Device & { id: string }

const c = createColumnHelper<DeviceWithId>()
const dtf = createColumnConfigHelper<DeviceWithId>()

export const getColumns = ({ deviceBaseUrl }: { deviceBaseUrl: string }) => {
  return [
    c.accessor((r) => r.status, {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <DeviceStatusBadge device={row.original} />,
    }),
    c.accessor('name', {
      id: 'name',
      header: 'Device',
      cell: ({ row }) => {
        const href = `${deviceBaseUrl}/${row.original._id}`
        return (
          <Link href={{ pathname: href }}>
            <DeviceName device={row.original} />
          </Link>
        )
      },
    }),
    // c.accessor('_id', {
    //   id: 'convex_id',
    //   header: 'Convex ID',
    //   cell: ({ cell }) => (
    //     <div className="inline-flex w-full justify-start">
    //       <Badge variant="secondary">{cell.getValue()}</Badge>
    //     </div>
    //   ),
    // }),
    c.accessor('mode', {
      id: 'trackingMode',
      header: 'Tracking',
      cell: ({ cell }) => (
        <div className="inline-flex w-full justify-start">
          <Badge variant="secondary">{cell.getValue()}</Badge>
        </div>
      ),
    }),
    c.accessor('settings.location.timeout', {
      id: 'updateInterval',
      header: 'Tracking Interval',
      cell: ({ cell }) => <span>{dayjs.duration(cell.getValue(), 'ms').humanize(false)}</span>,
    }),
    c.accessor('settings.heartbeat.interval', {
      id: 'heartbeatInterval',
      header: 'Heartbeat Interval',
      cell: ({ cell }) => (
        <span>{dayjs.duration(cell.getValue() ?? 60_000, 'ms').humanize(false)}</span>
      ),
    }),
    c.accessor('_id', {
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
        <div className="inline-flex w-full justify-end gap-1">
          <SessionButton size="sm" deviceId={row.original._id} />
          <DeviceActionsMenu device={row.original} />
        </div>
      ),
    }),
  ]
}

export type DeviceTableColumns = ReturnType<typeof getColumns>

export function getDeviceFilters() {
  return [
    dtf
      .text()
      .id('name')
      .displayName('Device Name')
      .icon(Monitor)
      .accessor((row) => row.name)
      .build(),
    dtf
      .option()
      .id('status')
      .displayName('Status')
      .icon(BellIcon)
      .accessor((row) => row.status)
      .build(),
    dtf
      .option()
      .id('mode')
      .displayName('Tracking Mode')
      .accessor((row) => row.mode)
      .icon(MapPinIcon)
      .build(),
  ]
}
