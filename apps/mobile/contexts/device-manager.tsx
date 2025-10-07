import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Id, Device } from '@workspace/backend/types'
import { createContext } from '@workspace/react-utils'
import { useSecureStore } from '@/lib/hooks/use-secure-store'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export namespace DeviceManager {
  export type Value = {
    device: Device | null | undefined
    register: () => Promise<void>
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

  const [deviceId, saveId, clearId] = useSecureStore<Id<'devices'> | undefined>({ key: 'deviceId' })
  const device = useQuery(api.devices.get.one, { deviceId })
  const registerMutation = useMutation(api.devices.manage.register)

  const register = async () => {
    const id = await registerMutation({ platform: Platform.OS, deviceId })
    console.info('Device registrationResult:', id)
    return id ? saveId(id) : clearId()
  }

  // handle changes server side, i.e. when we remove the device from some other client
  useEffect(() => {
    // device id is invalid, clear it
    if (device === null && deviceId) {
      console.info('no device found. Clearing deviceId from secure store')
      clearId()
    }
    if (device && device._id !== deviceId) {
      console.info('Device is registered:', device)
      saveId(device._id)
    }
  }, [device, clearId, deviceId, saveId])

  const value: DeviceManager.Value = {
    device,
    deviceId,
    register: register,
    isRegistered: !!device?._id,
  }

  return <Provider value={value}>{children}</Provider>
}
