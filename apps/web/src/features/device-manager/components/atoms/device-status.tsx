'use client'

import { useMemo } from 'react'
import { Badge } from '@workspace/ui/components/badge'

import { cn } from '@/lib/utils'
import type { Device } from '../../types'

export function DeviceStatusBadge({ device }: { device: Device }) {
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
    <Badge variant="secondary" className={cn('max-md:aspect-square')}>
      <span className={cn('h-2 w-2 rounded-full', color)} />
      <span className="max-md:sr-only">{device.status}</span>
    </Badge>
  )
}
