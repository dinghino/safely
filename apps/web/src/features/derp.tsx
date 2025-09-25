import { useState, useRef, useCallback, useEffect } from 'react'
import { createContext } from '@workspace/react-utils'
import { useQuery, useMutation } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Doc } from '@workspace/backend/dataModel'
import type { LocationMetadata } from '@workspace/backend/types'
import { useDeviceId } from '@/shared/hooks/use-device-id'

import { useRegisterDevice } from './device-tracking'

type DeviceSettings = Doc<'deviceSettings'>
type DeviceDoc = Doc<'devices'>
type ActiveSession = Doc<'trackSession'>
// unused for now. leave for future reference
// type SessionData = FunctionReturnType<typeof api.tracking.getSessionLocations>
type Point = { latitude: number; longitude: number }
type LocationData = { point: Point; metadata: LocationMetadata }

type Device = DeviceDoc & { settings: DeviceSettings }

interface LocationState {
  currentLocation: LocationData | null
  isWatching: boolean
  error: string | null
  lastUpdate: number | null
}

interface DeviceLocationContextValue extends LocationState {
  startWatching: (options?: DeviceLocationManager.LocationOptions) => void
  stopWatching: () => void
  getCurrentLocation: (options?: DeviceLocationManager.LocationOptions) => Promise<LocationData>
}

const [DeviceLocationContext, useDeviceLocation] =
  createContext<DeviceLocationContextValue>('DeviceLocationContext')

export { useDeviceLocation }

export namespace DeviceLocationManager {
  export type LocationOptions = {
    highAccuracy?: boolean
  }
  export type Props = {
    children: React.ReactNode
  }
}

export const DeviceLocationManager: React.FC<DeviceLocationManager.Props> = (props) => {
  const { children } = props

  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    isWatching: false,
    error: null,
    lastUpdate: null,
  })

  const watchIdRef = useRef<number | null>(null)
  const highAccuracyRef = useRef(false)

  const transformPosition = useCallback((position: GeolocationPosition): LocationData => {
    return {
      point: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      metadata: {
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
      },
    }
  }, [])

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const locationData = transformPosition(position)
      setState((prev) => ({
        ...prev,
        currentLocation: locationData,
        error: null,
        lastUpdate: Date.now(),
      }))
    },
    [transformPosition],
  )

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
    }))
  }, [])

  const getCurrentLocation = useCallback(
    (opts: DeviceLocationManager.LocationOptions = {}): Promise<LocationData> => {
      const { highAccuracy = false } = opts
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }

        const options: PositionOptions = {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: highAccuracy ? 0 : 300000, // 5 minutes for normal accuracy
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = transformPosition(position)
            resolve(locationData)
          },
          (error) => {
            reject(new Error(error.message))
          },
          options,
        )
      })
    },
    [transformPosition],
  )

  const startWatching = useCallback(
    (opts: DeviceLocationManager.LocationOptions = {}) => {
      const { highAccuracy = false } = opts
      if (!navigator.geolocation) {
        setState((prev) => ({ ...prev, error: 'Geolocation is not supported' }))
        return
      }

      // Stop existing watch if precision requirements changed
      if (watchIdRef.current && highAccuracyRef.current !== highAccuracy) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }

      if (watchIdRef.current) return // Already watching with same precision

      highAccuracyRef.current = highAccuracy

      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: highAccuracy ? 10000 : 300000, // More frequent updates for high accuracy
      }

      watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options)

      setState((prev) => ({ ...prev, isWatching: true, error: null }))
    },
    [handleSuccess, handleError],
  )

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      highAccuracyRef.current = false
    }
    setState((prev) => ({ ...prev, isWatching: false }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const value: DeviceLocationContextValue = {
    ...state,
    startWatching,
    stopWatching,
    getCurrentLocation,
  }

  return <DeviceLocationContext value={value}>{children}</DeviceLocationContext>
}

interface UseHeartbeatOptions {
  device: Device | null | undefined
  enabled?: boolean
}

export const useHeartbeat = ({ device, enabled = true }: UseHeartbeatOptions) => {
  const { currentLocation } = useDeviceLocation()
  const heartbeat = useMutation(api.devices.heartbeat)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const deviceRef = useRef<Device | null | undefined>(null)
  const locationRef = useRef<LocationData | null>(null)

  // Keep refs updated without triggering effects
  useEffect(() => {
    deviceRef.current = device
  }, [device])

  useEffect(() => {
    locationRef.current = currentLocation
  }, [currentLocation])

  const sendHeartbeat = useCallback(async () => {
    const currentDevice = deviceRef.current
    if (!currentDevice) return

    const currentLocationData = locationRef.current
    const { trackingMode } = currentDevice.settings

    try {
      // Include location data based on tracking mode
      const shouldIncludeLocation = trackingMode !== 'off' && currentLocationData

      await heartbeat({
        deviceId: currentDevice._id,
        location: shouldIncludeLocation ? currentLocationData : undefined,
      })

      console.log(`Heartbeat sent for device ${currentDevice._id}`, {
        trackingMode,
        hasLocation: !!shouldIncludeLocation,
      })
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }, [heartbeat])

  const startHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const currentDevice = deviceRef.current
    if (!currentDevice) return

    const intervalMs = currentDevice.settings.updateIntervalMs

    // Send initial heartbeat
    sendHeartbeat()

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, intervalMs)

    console.log(`Heartbeat started with interval: ${intervalMs}ms`)
  }, [sendHeartbeat])

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log('Heartbeat stopped')
    }
  }, [])

  // Start/restart heartbeat when device settings change
  useEffect(() => {
    if (!enabled || !device) {
      stopHeartbeat()
      return
    }

    startHeartbeat()

    return stopHeartbeat
  }, [
    device?.settings.updateIntervalMs,
    device?.deviceId,
    enabled,
    // startHeartbeat,
    // stopHeartbeat,
    device,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return stopHeartbeat
  }, [stopHeartbeat])

  return {
    sendHeartbeat,
    startHeartbeat,
    stopHeartbeat,
  }
}

interface SessionState {
  activeSession: ActiveSession | null
  isTracking: boolean
  error: string | null
}

interface SessionManagerContextValue extends SessionState {
  startTracking: () => void
  stopTracking: () => void
}

const [SessionManagerContext, useSessionManager] =
  createContext<SessionManagerContextValue>('SessionManagerContext')

export { useSessionManager }

export namespace SessionManagerProvider {
  export type Props = {
    children: React.ReactNode
  }
}

export const SessionManagerProvider: React.FC<SessionManagerProvider.Props> = (props) => {
  const { children } = props
  const { device } = useDeviceContext()

  const [state, setState] = useState<SessionState>({
    activeSession: null,
    isTracking: false,
    error: null,
  })

  const { currentLocation, startWatching, stopWatching } = useDeviceLocation()
  const addLocationPoint = useMutation(api.tracking.addLocationPoint)

  // Query for active session when device is available
  const activeSession = useQuery(api.tracking.getActiveSession, { deviceId: device?._id })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const deviceRef = useRef<Device | null | undefined>(null)
  const locationRef = useRef<LocationData | null>(null)
  const sessionRef = useRef<ActiveSession | null>(null)

  // Keep refs updated
  useEffect(() => {
    deviceRef.current = device
  }, [device])

  useEffect(() => {
    locationRef.current = currentLocation
  }, [currentLocation])

  useEffect(() => {
    sessionRef.current = activeSession ?? null
    setState((prev) => ({ ...prev, activeSession: activeSession ?? null }))
  }, [activeSession])

  const sendLocationPoint = useCallback(async () => {
    const currentDevice = deviceRef.current
    const currentLocationData = locationRef.current
    const currentSession = sessionRef.current

    if (!currentDevice || !currentLocationData || !currentSession) {
      return
    }

    try {
      await addLocationPoint({
        sessionId: currentSession._id,
        point: currentLocationData.point,
        metadata: currentLocationData.metadata,
      })

      console.log('Location point added to session', currentSession._id)
    } catch (error) {
      console.error('Failed to add location point:', error)
      setState((prev) => ({ ...prev, error: (error as Error).message }))
    }
  }, [addLocationPoint])

  const startLocationTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const currentDevice = deviceRef.current
    if (!currentDevice) return

    const intervalMs = currentDevice.settings.updateIntervalMs

    // Send initial location point
    sendLocationPoint()

    // Set up interval for tracking
    intervalRef.current = setInterval(sendLocationPoint, intervalMs)

    console.log(`Session tracking started with interval: ${intervalMs}ms`)
  }, [sendLocationPoint])

  const stopLocationTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log('Session tracking stopped')
    }
  }, [])

  const startTracking = useCallback(() => {
    setState((prev) => ({ ...prev, isTracking: true, error: null }))
    // Request high accuracy for session tracking
    startWatching({ highAccuracy: true })
    startLocationTracking()
  }, [startWatching, startLocationTracking])

  const stopTracking = useCallback(() => {
    setState((prev) => ({ ...prev, isTracking: false }))
    stopLocationTracking()
    // Switch back to normal accuracy (or stop if not needed for heartbeat)
    startWatching({ highAccuracy: false })
  }, [stopLocationTracking, startWatching])

  // Auto start/stop tracking based on device trackingMode and active session
  useEffect(() => {
    if (!device || !activeSession) {
      if (state.isTracking) {
        stopTracking()
      }
      return
    }

    const { trackingMode } = device.settings
    const shouldTrack = trackingMode !== 'off'

    if (shouldTrack && !state.isTracking) {
      startTracking()
    } else if (!shouldTrack && state.isTracking) {
      stopTracking()
    }
  }, [device?.settings.trackingMode, activeSession, state.isTracking, startTracking, stopTracking])

  // Restart tracking when updateIntervalMs changes
  useEffect(() => {
    if (state.isTracking && device) {
      startLocationTracking()
    }
  }, [device?.settings.updateIntervalMs, state.isTracking, startLocationTracking])

  // Cleanup on unmount
  useEffect(() => {
    return stopLocationTracking
  }, [stopLocationTracking])

  const value: SessionManagerContextValue = {
    ...state,
    startTracking,
    stopTracking,
  }

  return <SessionManagerContext value={value}>{children}</SessionManagerContext>
}

export interface DeviceContextValue {
  registerDevice: () => Promise<void>
  canRegister: boolean
  device: Device | null | undefined
}

const [DeviceContext, useDeviceContext] = createContext<DeviceContextValue>('DeviceContext')

export namespace DeviceContextProvider {
  export type Props = {
    children: React.ReactNode
  }
}

export const DeviceContextProvider: React.FC<DeviceContextProvider.Props> = ({ children }) => {
  const registerDevice = useRegisterDevice()
  const [deviceId] = useDeviceId()
  const device = useQuery(api.devices.get, { deviceId })

  const { startWatching, stopWatching } = useDeviceLocation()
  useHeartbeat({ device, enabled: !!device })

  useEffect(() => {
    if (!device) {
      stopWatching()
      return
    }

    const { trackingMode } = device.settings

    if (trackingMode === 'off') {
      stopWatching()
    } else {
      // Start with normal accuracy - SessionManager will upgrade when needed
      startWatching({ highAccuracy: false })
    }
  }, [device, startWatching, stopWatching])

  const value: DeviceContextValue = {
    device,
    registerDevice,
    canRegister: !device,
  }

  return <DeviceContext value={value}>{children}</DeviceContext>
}

const FullProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DeviceLocationManager>
      <DeviceContextProvider>
        <SessionManagerProvider>{children}</SessionManagerProvider>
      </DeviceContextProvider>
    </DeviceLocationManager>
  )
}

export default FullProvider

// Updated usage example:

// const App: React.FC = () => {
//   return (
//     <DeviceLocationProvider>
//       <DeviceManager />
//     </DeviceLocationProvider>
//   );
// };

// const DeviceManager: React.FC = () => {
//   const [deviceId] = useDeviceId();
//   const device = useQuery(api.devices.get, { deviceId });
//   const { startWatching, stopWatching } = useDeviceLocation();

//   // Start heartbeat
//   useHeartbeat({
//     device,
//     enabled: !!device
//   });

//   // Start basic location watching for heartbeat
//   useEffect(() => {
//     if (!device) {
//       stopWatching();
//       return;
//     }

//     const { trackingMode } = device.settings;

//     if (trackingMode === 'off') {
//       stopWatching();
//     } else {
//       // Start with normal accuracy - SessionManager will upgrade when needed
//       startWatching(false);
//     }
//   }, [device?.settings.trackingMode, startWatching, stopWatching]);

//   return (
//     <SessionManagerProvider device={device}>
//       {/* Your device UI here */}
//     </SessionManagerProvider>
//   );
// };
