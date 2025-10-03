import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Doc, Id } from '@workspace/backend/dataModel'
import { createContext } from '@workspace/react-utils'
import { useSecureStore } from '@/lib/hooks/use-secure-store'
import { useCallback } from 'react'
import { Alert } from 'react-native'

export namespace DeviceManager {
  export type Value = {
    device: (Doc<'devices'> & { settings: Doc<'deviceSettings'> }) | null | undefined
    registerDevice: () => Promise<void>
    deviceId: Id<'devices'> | undefined
    isRegistered: boolean
  }
  export type Props = {
    children: React.ReactNode
  }
}

const [Provider, useDeviceContext] = createContext<DeviceManager.Value>('DeviceManager')

export { useDeviceContext }

export const DeviceManager = ({ children }: DeviceManager.Props) => {
  const [deviceId, setDeviceId] = useSecureStore<Id<'devices'>>({ key: 'deviceId' })
  const device = useQuery(api.devices.get, { deviceId })

  const register = useMutation(api.devices.register)

  const registerDevice = useCallback(async () => {
    // device already registered
    if (deviceId) return Alert.alert('Device already registered', `Device ID: ${deviceId}`, [
      { text: 'OK' }

    ])
    // todo: add device info from expo-device
    // see https://docs.expo.dev/versions/latest/sdk/device/
    const id = await register({})
    setDeviceId(id)
  }, [deviceId, register, setDeviceId])

  const value: DeviceManager.Value = {
    device,
    registerDevice,
    deviceId,
    isRegistered: !!deviceId,
  }

  return <Provider value={value}>{children}</Provider>
}
