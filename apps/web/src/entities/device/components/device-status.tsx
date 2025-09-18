'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import type { Device } from '@/entities/device/types'

export namespace DeviceStatusBadge {
  export type Props = {
    device: Device
    className?: string
  }
}

export function DeviceStatusBadge(props: DeviceStatusBadge.Props) {
  const { device, className } = props
  const color = useMemo(() => {
    switch (device.status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }, [device.status])
  device.status
  return (
    <Badge variant="secondary" className={cn('@max-lg:aspect-square max-md:aspect-square', className)}>
      <span className={cn('h-2 w-2 rounded-full', color)} />
      <span className="@max-lg:sr-only max-md:sr-only">{device.status}</span>
    </Badge>
  )
}
