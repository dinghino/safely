import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'
import type { Device } from '@/entities/device/types'

import { useDeviceLocation } from '../../location-manager'
import { useDeviceContext } from '../../device-manager'
import type { LocationData } from '../../location-manager/types'

import { SessionManagerContext } from '../contexts'
import type { SessionManagerProvider, SessionState, ActiveSession } from '../types'

// @copilot: This component has complex useEffect dependencies and state management
// todo: Consider using useReducer for state management and splitting complex effects
export const SessionProvider: React.FC<SessionManagerProvider.Props> = (props) => {
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
  // @copilot: This effect has complex logic that could benefit from being split
  // todo: Consider using a state machine or splitting into multiple focused effects
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

  const value = {
    ...state,
    startTracking,
    stopTracking,
  }

  return <SessionManagerContext value={value}>{children}</SessionManagerContext>
}
