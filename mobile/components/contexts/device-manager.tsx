import { createContext, useCallback, useContext, useEffect } from 'react'
import { Platform } from 'react-native'
import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Id, Device } from '@workspace/backend/types'
// import { createContext } from '@workspace/react-utils'

import type { Location } from 'react-native-background-geolocation'

import * as helpers from '@/lib/geolocation'
import { useDeviceId, useDeviceInfo, useSessionToken } from '@/lib/hooks/auth-hooks'

export namespace DeviceManager {
  export type Value = {
    device: Device | null | undefined
    settings: Device['settings'] | null | undefined
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
  // secure store
  const [deviceId, saveId, clearId] = useDeviceId()
  const [sessionToken, setSessionToken, clearSessionToken] = useSessionToken()
  // store the whole device entity locally for background tasks and offline use
  // this will update whenever the device changes, including settings and other metadata
  const [_, storeDevice, clearDevice] = useDeviceInfo()
  // --------------------------------------------------------------------------
  // db queries and mutations
  const device = useQuery(api.devices.get.one, { deviceId })
  const settings = useQuery(api.devices.get.settings, { deviceId })
  const registerMutation = useMutation(api.devices.manage.register)
  const disconnectMutation = useMutation(api.devices.heartbeat.disconnect)
  const heartbeatMutation = useMutation(api.devices.heartbeat.send)

  // --------------------------------------------------------------------------
  // actions

  const register = async () => {
    try {
      const response = await registerMutation({ platform: Platform.OS, sessionToken })
      console.info('Device registrationResult:', response)
      if (!response) throw new Error('Device registration failed')
      saveId(response.deviceId)
      setSessionToken(response.sessionToken)
      // ping first heartbeat right away - session should be valid already
      await heartbeatMutation({ sessionToken: response.sessionToken })
    } catch (e) {
      console.error('Device registration error:', e)
      clearId()
      clearSessionToken()
    }
  }

  // handle graceful disconnect on unmount
  // todo: we need to "reconnect" in headless by sending a heartbeat again when it starts
  // even if we don't have a location yet -- or we just wait for the geolocator to do
  // its thing and send a normal heartbeat with location
  useEffect(() => {
    if (!deviceId || !sessionToken) return
    heartbeatMutation({ sessionToken })
    return () => {

      console.log('💔 [Manager] Disconnecting device on unmount')
      disconnectMutation({ sessionToken }).catch((e) => {
        console.error('💔 [Manager] Error disconnecting device on unmount', e)
      })
    }
  }, [deviceId, sessionToken, disconnectMutation, heartbeatMutation])

  // biome-ignore lint/correctness/useExhaustiveDependencies: mutation is stable
  const heartbeat = useCallback(
    async (data: Location) => {
      if (!sessionToken) {
        console.log('💔 [Manager::heartbeat] No token available, skipping heartbeat')
        return
      }
      // we need to extract the timestamp to avoid sending it to the server for now
      // todo: make server accept location timestamp
      const { timestamp, ...location } = helpers.transformLocation(data)
      console.log('💓 [Manager::heartbeat] Sending heartbeat with location')
      const response = await heartbeatMutation({ sessionToken, location })

      const token = response.sessionToken
      if (token && token !== sessionToken) setSessionToken(token)
    },
    [deviceId, sessionToken],
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
    settings,
    deviceId,
    register,
    heartbeat,
    isRegistered: !!device?._id,
  }

  return <Provider value={value}>{children}</Provider>
}
