'use client'

import { api } from '@workspace/backend/api'
import { useMutation } from 'convex/react'
import { useDeviceInfo } from './use-device-info'

export function useRegisterDevice() {
  const deviceInfo = useDeviceInfo()
  const register = useMutation(api.devices.register)

  return async function registerDevice() {
    const { deviceId, platform } = deviceInfo
    if (!deviceId) return
    await register({ deviceId, platform })
  }
}
