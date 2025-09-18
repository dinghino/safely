import { useMemo } from 'react'
import { useDeviceId } from './use-device-id'

interface DeviceInfo {
  deviceId: string
  userAgent: string
  platform: string
  language: string
  timezone: string
  cookieEnabled: boolean
  onlineStatus: boolean
}
export function useDeviceInfo() {
  const [deviceId] = useDeviceId()
  return useMemo(() => ({ deviceId, ...gatherDeviceInfo() }), [deviceId])
}

const gatherDeviceInfo = () => {
  const info: Omit<DeviceInfo, 'deviceId'> = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
  }

  return info
}
