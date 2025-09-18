import { useMutation } from 'convex/react'
import { useDeviceInfo } from './use-device-info'
import { api } from '@workspace/backend/api'
import type { DeviceStatus } from '@workspace/backend/types'

export function useRegisterDevice() {
  const deviceInfo = useDeviceInfo()
  const register = useMutation(api.devices.registerDevice)

  return async function registerDevice({ status = 'online' }: { status: DeviceStatus }) {
    const { deviceId, platform } = deviceInfo
    if (!deviceId) return
    await register({ deviceId, platform, status })
  }
}
