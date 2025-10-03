'use client'

import { useMemo } from 'react'
import { useDeviceInfo } from './use-device-info'

export function useIsCurrent({ device }: { device?: { _id: string } }) {
  const local = useDeviceInfo()
  return useMemo(() => device?._id === local.deviceId, [device, local])
}
