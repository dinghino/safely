'use client'

import type { Device } from '@/features/device-manager/types'
import { cn } from '@/lib/utils'

export function DevicePlatform({ device }: { device: Device }) {
  const platform = device.platform ?? 'Unknown platform'
  const hasPlatform = Boolean(device.platform)
  return <span className={cn(!hasPlatform && 'text-muted-foreground')}>{platform}</span>
}
