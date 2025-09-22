import { useState, useRef, useCallback, useEffect } from 'react'
import type { DeviceLocationManager, LocationState } from '../types'

import { createContext } from '@workspace/react-utils'
import { transformPosition } from '@/entities/session/lib'
import type { LocationData } from '@/entities/session/types'

import type { DeviceLocationContextValue } from '../types'

const [DeviceLocationContext, useDeviceLocation] =
  createContext<DeviceLocationContextValue>('DeviceLocationContext')

export const DeviceLocationProvider: React.FC<DeviceLocationManager.Props> = (props) => {
  const { children } = props

  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    isWatching: false,
    error: null,
    lastUpdate: null,
  })

  const watchIdRef = useRef<number | null>(null)
  const highAccuracyRef = useRef(false)

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const locationData = transformPosition(position)
    setState((prev) => ({
      ...prev,
      currentLocation: locationData,
      error: null,
      lastUpdate: Date.now(),
    }))
  }, [])

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
    [],
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

  const value = {
    ...state,
    startWatching,
    stopWatching,
    getCurrentLocation,
  }

  return <DeviceLocationContext value={value}>{children}</DeviceLocationContext>
}

// Re-export the hook for convenience
export { useDeviceLocation }
