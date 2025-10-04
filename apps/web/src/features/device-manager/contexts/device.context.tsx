'use client'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'

import { useDeviceId } from '@/shared/hooks/use-device-id'

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
  const register = useMutation(api.devices.register)
  const deviceInfo = useDeviceInfo()

  const [deviceId, setId, clearId] = useDeviceId()

  const device = useQuery(api.devices.get, { deviceId })

  const registerDevice = async () => {
    if (deviceId) return // device already registered
    const { platform } = deviceInfo
    const id = await register({ platform })
    return id ? setId(id) : clearId()
  }

  const value = {
    device,
    registerDevice,
    canRegister: !device,
  }

  return <DeviceContext value={value}>{children}</DeviceContext>
}

export default DeviceProvider
