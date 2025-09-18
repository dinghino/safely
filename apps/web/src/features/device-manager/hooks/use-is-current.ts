'use client'

import { useMemo } from 'react'
import { useDeviceInfo } from './use-device-info'

export function useIsCurrent({ device }: { device: { deviceId: string } }) {
  const local = useDeviceInfo()
  return useMemo(() => device.deviceId === local.deviceId, [device, local])
}
