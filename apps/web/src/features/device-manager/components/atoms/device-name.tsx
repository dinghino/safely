'use client'

import { useIsCurrent } from '@/features/device-manager/hooks'
import type { Device } from '@/features/device-manager/types'
import { cn } from '@/lib/utils'

export function DeviceName({ device }: { device: Device }) {
  const isCurrent = useIsCurrent({ device })
  const name = device.name ?? 'Unknown device'
  const hasName = Boolean(device.name)
  return (
    <div className="inline-flex w-full items-center justify-between gap-2">
      {/* <DeviceStatusBadge device={device} /> */}
      <span className={cn(!hasName && 'text-muted-foreground', isCurrent && 'font-bold')}>
        {name}
      </span>
      {/* <CurrentIndicator device={row.original} /> */}
    </div>
  )
}
