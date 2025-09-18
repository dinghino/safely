'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { toast } from 'sonner'

interface DeviceLocation {
  latitude: number
  longitude: number
}

type LocationState = (
  | {
      location: null
      isLoading: true
      error: null
    } // initial loading state
  | {
      location: DeviceLocation
      isLoading: boolean
      error: null
      previous: LocationState
    } // successful location fetch
  | {
      location: null
      isLoading: boolean
      error: string
    }
) & { isWatching: boolean; timestamp: number } // error state

type LocationAction =
  | { type: 'REQUEST_START' }
  | { type: 'REQUEST_SUCCESS'; payload: DeviceLocation }
  | { type: 'REQUEST_ERROR'; payload: string }
  | { type: 'START_WATCHING' }
  | { type: 'STOP_WATCHING' }
  | { type: 'RESET' }

interface UseDeviceLocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

const initialLocationState: LocationState = {
  location: null,
  error: '',
  isLoading: false,
  isWatching: false,
  timestamp: 0,
}

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  console.log('Location action:', action)
  const timestamp = Date.now()
  switch (action.type) {
    case 'REQUEST_START':
      return {
        ...state,
        location: null,
        isLoading: true,
        timestamp,
      }
    case 'REQUEST_SUCCESS':
      return {
        ...state,
        location: action.payload,
        isLoading: false,
        error: null,
        timestamp,
        previous: state,
      }
    case 'REQUEST_ERROR':
      toast.error(action.payload, {
        dismissible: true,
        closeButton: true,
      })
      return {
        ...state,
        location: null,
        isLoading: false,
        error: action.payload,
        timestamp,
      }
    case 'START_WATCHING':
      toast.message('Started watching location', {
        dismissible: true,
        closeButton: true,
      })
      return {
        ...state,
        isWatching: true,
        timestamp,
      }
    case 'STOP_WATCHING':
      return {
        ...state,
        isWatching: false,
        timestamp,
      }
    case 'RESET':
      return { ...initialLocationState, timestamp }
    default:
      return state
  }
}

export function useDeviceLocation(options: UseDeviceLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    watch = false,
  } = options

  const [state, dispatch] = useReducer(locationReducer, {
    ...initialLocationState,
    isWatching: watch,
  })

  const watchIdRef = useRef<number | null>(null)

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords
    dispatch({ type: 'REQUEST_SUCCESS', payload: { latitude, longitude } })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    let payload = 'Failed to get location'

    switch (error.code) {
      case error.PERMISSION_DENIED:
        payload = 'Location access denied by user'
        break
      case error.POSITION_UNAVAILABLE:
        payload = 'Location information unavailable'
        break
      case error.TIMEOUT:
        payload = 'Location request timed out'
        break
      default:
        payload = error.message ?? 'Unknown error occurred'
    }
    dispatch({ type: 'REQUEST_ERROR', payload })
  }, [])

  const positionOptions: PositionOptions = useMemo(
    () => ({
      enableHighAccuracy,
      timeout,
      maximumAge,
    }),
    [enableHighAccuracy, timeout, maximumAge],
  )

  const getCurrentLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      dispatch({ type: 'REQUEST_ERROR', payload: 'Geolocation is not supported' })
      return
    }

    console.log('Getting current location...')
    dispatch({ type: 'REQUEST_START' })
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, positionOptions)
  }, [handleSuccess, handleError, positionOptions])

  const startWatching = useCallback(() => {
    if (!navigator?.geolocation) {
      dispatch({ type: 'REQUEST_ERROR', payload: 'Geolocation is not supported' })
      return
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    console.log('Starting location watcher...')
    dispatch({ type: 'START_WATCHING' })

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      positionOptions,
    )
  }, [handleSuccess, handleError, positionOptions])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('Stopping location watcher...')
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    dispatch({ type: 'STOP_WATCHING' })
  }, [])

  const toggleWatching = useCallback(() => {
    return state.isWatching ? stopWatching() : startWatching()
  }, [state.isWatching, startWatching, stopWatching])

  // Handle initial watch option
  useEffect(() => {
    if (!watch) return

    if (!watch) startWatching()
    else if (watch) stopWatching()
  }, [watch, startWatching, stopWatching])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    ...state,
    getCurrentLocation,
    startWatching,
    stopWatching,
    toggleWatching,
    reset: () => dispatch({ type: 'RESET' }),
  }
}
