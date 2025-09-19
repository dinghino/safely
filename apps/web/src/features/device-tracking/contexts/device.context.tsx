'use client'

// import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'
// import { useMutation } from 'convex/react'
import { useRegisterDevice } from '../hooks'
import { useDeviceLocation } from '@/shared/hooks/use-device-location'
import { useHeartbeat, type HeartbeatLocation } from '../hooks/use-heartbeat'
import { useDeviceId } from '@/shared/hooks/use-device-id'
import { useMemo, useRef } from 'react'
import type { LocationMetadata } from '@workspace/backend/types'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

type DeviceContext = {
  registerDevice: () => Promise<void>
  canRegister: boolean
}

const [Provider, useContext] = createContext<DeviceContext>('DeviceContext')

export { useContext as useDeviceContext }

export namespace DeviceContextProvider {
  export type Props = {
    children: React.ReactNode
  }
}

export const DeviceContextProvider = ({ children }: DeviceContextProvider.Props) => {
  const registerDevice = useRegisterDevice()

  const [deviceId] = useDeviceId()
  const device = useQuery(api.devices.get, { deviceId })

  const interval = useMemo(() => device?.settings.updateIntervalMs, [device])
  const location = useLocationData({
    interval,
    enabled: device?.settings.trackingMode !== 'off',
  })

  useHeartbeat({ deviceId: device?._id, location, interval })

  const value: DeviceContext = useMemo(
    () => ({
      registerDevice,
      canRegister: !device,
    }),
    [registerDevice, device],
  )

  return <Provider value={value}>{children}</Provider>
}

function useLocationData({
  enabled,
  interval,
}: {
  enabled?: boolean
  interval?: number | undefined
} = {}): HeartbeatLocation | undefined {
  const locator = useDeviceLocation({ watch: enabled, timeout: interval })

  const locationRef = useRef<typeof locator.location | undefined>(undefined)

  return useMemo(() => {
    if (!enabled) return undefined
    if (!locator.location) return undefined
    // only update if timestamp changes
    if (locator.timestamp === locationRef.current?.timestamp) {
      return makeLocationData(locationRef.current)
    }
    const data = makeLocationData(locator.location)
    // update ref with new data
    locationRef.current = locator.location
    return data
  }, [enabled, locator.location, locator.timestamp])
}

function makeLocationData(data: GeolocationPosition | null) {
  if (!data) return
  const { latitude, longitude } = data.coords
  if (!latitude || !longitude) return
  const point = { latitude, longitude }
  const metadata = makeMetadata(data)
  return { point, metadata }
}

function makeMetadata(data: GeolocationPosition): LocationMetadata {
  return {
    accuracy: data.coords.accuracy,
    altitude: data.coords.altitude ?? undefined,
    altitudeAccuracy: data.coords.altitudeAccuracy ?? undefined,
    heading: data.coords.heading ?? undefined,
    speed: data.coords.speed ?? undefined,
  }
}
