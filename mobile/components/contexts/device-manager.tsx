import { createContext, useCallback, useContext, useEffect } from 'react'
import { Platform } from 'react-native'
import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Id, Device } from '@workspace/backend/types'
// import { createContext } from '@workspace/react-utils'

import { STORE_KEY } from '@/constants'
import { useSecureStore } from '@/lib/hooks/use-secure-store'
import type { Location } from 'react-native-background-geolocation'

import * as helpers from '@/lib/geolocation'

export namespace DeviceManager {
  export type Value = {
    device: Device | null | undefined
    register: () => Promise<void>
    deviceId: Id<'devices'> | undefined
    isRegistered: boolean
    heartbeat: (location: Location) => Promise<void>
  }
  export type Props = {
    children: React.ReactNode
  }
}
// todo: add link to local workspace package
// const [Provider, useDeviceContext] = createContext<DeviceManager.Value>('DeviceManager')

const Context = createContext<DeviceManager.Value | undefined>(undefined)
const { Provider } = Context

function useDeviceContext() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceManagerProvider')
  }
  return context
}

export { useDeviceContext }

/**
 * Provides device management functionality, including registration
 * and heartbeat sending to the backend server.
 *
 * todo: remove internal deviceId storage and rely on the device entity only?
 */
export const DeviceManager = ({ children }: DeviceManager.Props) => {
  const [deviceId, saveId, clearId] = useSecureStore<Id<'devices'>>({
    key: STORE_KEY.DEVICE_ID,
  })
  const [sessionToken, setSessionToken, clearSessionToken] = useSecureStore<string>({
    key: STORE_KEY.DEVICE_SESSION_TOKEN,
  })

  // store the whole device entity locally for background tasks and offline use
  // this will update whenever the device changes, including settings and other metadata
  const [_, storeDevice, clearDevice] = useSecureStore<Device>({
    key: STORE_KEY.DEVICE,
    loader: JSON.parse,
    transformer: JSON.stringify,
  })
  // --------------------------------------------------------------------------
  // db stuff
  const device = useQuery(api.devices.get.one, { deviceId })
  const registerMutation = useMutation(api.devices.manage.register)
  const heartbeatMutation = useMutation(api.devices.heartbeat.send)

  // --------------------------------------------------------------------------
  // actions

  const register = async () => {
    const id = await registerMutation({ platform: Platform.OS, deviceId })
    console.info('Device registrationResult:', id)
    return id ? saveId(id) : clearId()
  }

  const heartbeat = useCallback(
    async (location: Location) => {
      if (!device) {
        console.log('💔 [Manager::heartbeat] No device registered, skipping heartbeat')
        return
      }
      // we need to extract the timestamp to avoid sending it to the server for now
      // todo: make server accept location timestamp
      const { timestamp, ...transformedLocation } = helpers.transformLocation(location)
      console.log('💓 [Manager::heartbeat] Sending heartbeat with location')
      const deviceId = device._id
      const response = await heartbeatMutation({ deviceId, location: transformedLocation })

      const token = response.sessionToken
      if (token && token !== sessionToken) setSessionToken(token)
    },
    [device, sessionToken, setSessionToken, heartbeatMutation],
  )

  // --------------------------------------------------------------------------
  // effects

  // keep the device id in sync with the registered device - this should only be
  // called once (on mount) or when the device is registered or unregistered
  useEffect(() => {
    if (device === undefined) return // still loading

    // device id is invalid, clear it
    if (device === null && deviceId) {
      console.info('no device found. Clearing deviceId from secure store')
      clearId()
      clearSessionToken()
    }
    if (device && device._id !== deviceId) {
      console.info('Device is registered:', device)
      saveId(device._id)
    }
  }, [device, clearId, deviceId, saveId, clearSessionToken])

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable functions
  useEffect(() => {
    if (device === undefined) return // still loading
    if (device) {
      storeDevice(device)
    } else {
      clearDevice()
    }
  }, [device])

  const value: DeviceManager.Value = {
    device,
    deviceId,
    register,
    heartbeat,
    isRegistered: !!device?._id,
  }

  return <Provider value={value}>{children}</Provider>
}
