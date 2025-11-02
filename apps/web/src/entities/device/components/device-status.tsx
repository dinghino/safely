'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import type { Device } from '@/entities/device/types'
import { getDeviceStatusColor } from '@/entities/device/lib/device-status-color'

export namespace DeviceStatusBadge {
  export type Props = {
    device: Device
    className?: string
    label?: boolean
  } & Omit<React.ComponentProps<typeof Badge>, 'children'>
}

export function DeviceStatusBadge(props: DeviceStatusBadge.Props) {
  const { device, className, label = true, ...rest } = props
  return (
    <Badge
      variant="secondary"
      {...rest}
      className={cn('@max-lg:aspect-square max-md:aspect-square', !label && 'p-1.5', className)}
    >
      <DeviceStatusDot device={device} />
      {label && <span className="@max-lg:sr-only max-md:sr-only">{device.status}</span>}
    </Badge>
  )
}

export function DeviceStatusDot(props: { device: Device; className?: string }) {
  const { device, className } = props
  const color = useMemo(() => getDeviceStatusColor(device), [device])
  return <span className={cn('h-2 w-2 rounded-full', color, className)} />
}
