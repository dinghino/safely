'use client'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'

import { useDeviceId } from '@/shared/hooks/use-device-id'

import type { Device } from '@/entities/device/types'
import { useDeviceInfo } from '@/features/device-manager'
import { useEffect } from 'react'

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

  const device = useQuery(api.devices.get.one, { deviceId })

  const registerDevice = async () => {
    if (deviceId) return // device already registered
    const { platform } = deviceInfo
    const id = await register({ platform })
    return id ? setId(id) : clearId()
  }

  useEffect(() => {
    // waiting on query result
    if (device === undefined) return console.log('device query loading')
    // we have a device, so all good
    if (device) return console.log('device already registered')
    
    // no device -> clean localstorage id for future registering
    console.log('no device found, clearing local id')
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
