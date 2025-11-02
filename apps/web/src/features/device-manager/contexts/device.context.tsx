'use client'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'

import { useDeviceId } from '@/shared/hooks/use-device-id'
import { useDeviceToken } from '@/shared/hooks/use-device-token'

import type { Device } from '@/entities/device/types'
import { useDeviceInfo } from '@/features/device-manager'

export namespace DeviceProvider {
  export type Value = {
    registerDevice: () => Promise<void>
    canRegister: boolean
    device: Device | null | undefined
  }
  export type Props = {
    children: React.ReactNode
  }
}

const [DeviceContext, useDeviceContext] = createContext<DeviceProvider.Value>('DeviceContext')

export { useDeviceContext }

// @copilot: This component manages device registration and location watching
// todo: Consider extracting location watching logic to a separate hook
export const DeviceProvider: React.FC<DeviceProvider.Props> = ({ children }) => {
  const register = useMutation(api.devices.manage.register)
  const deviceInfo = useDeviceInfo()

  const [deviceId, setId, clearId] = useDeviceId()
  const [_, setToken] = useDeviceToken()

  const device = useQuery(api.devices.get.one, { deviceId })

  const registerDevice = async () => {
    if (deviceId) return // device already registered
    const { platform } = deviceInfo
    // todo: add sessionToken for refreshing existing sessions?
    const response = await register({ platform })
    if (!response) return

    setId(response.deviceId)
    setToken(response.sessionToken)
    // todo: add first heartbeat send
  }

  /**
   * Handle device registration state change from the server.
   * If we unregister this device from another device we need
   * to clear the local device id so we can register again.
   */
  useEffect(() => {
    // waiting on query result
    if (device === undefined) return
    // we have a device, so all good
    if (device) return

    // no device -> clean localstorage id for future registering
    clearId()
  }, [device, clearId])

  const value = {
    device,
    registerDevice,
    canRegister: !device,
  }

  return <DeviceContext value={value}>{children}</DeviceContext>
}

export default DeviceProvider
