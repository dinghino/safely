'use client'

import { useIsCurrent } from '@/features/device-manager/hooks'
import type { Device } from '@/entities/device/types'
import { cn } from '@/lib/utils'
import { DeviceStatusBadge } from './device-status'

export function DeviceName({ device, showBadge = false }: { device: Device, showBadge?: boolean }) {
  const isCurrent = useIsCurrent({ device })
  const name = device.name ?? 'Unknown device'
  const hasName = Boolean(device.name)
  return (
    <span className="inline-flex w-full items-center justify-between gap-2">
      {showBadge && <DeviceStatusBadge device={device} />}
      <span className={cn(!hasName && 'text-muted-foreground', isCurrent && 'font-bold')}>
        {name}
      </span>
    </span>
  )
}
