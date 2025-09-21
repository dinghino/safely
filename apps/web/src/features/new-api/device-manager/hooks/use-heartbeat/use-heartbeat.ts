import { useRef, useEffect, useReducer } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'

import { useWindowEvent } from '@/shared/hooks/use-window-event'

import type { Device } from '@/entities/device/types'
import type { LocationData } from '@/features/new-api/location-manager/types'

import { heartbeatReducer } from './heartbeat.reducer'

// flag to override internal systems. if this is false, if tracking mode is off
// the heartbeat won't set location
// todo: decide if to keep or move to device settings
const SEND_LOCATION_ALWAYS = true

function shouldSendLocation(trackingMode: string) {
  return SEND_LOCATION_ALWAYS || trackingMode !== 'off'
}

export interface UseHeartbeatOptions {
  device: Device | null | undefined
  enabled?: boolean
  location?: LocationData | null
  intervalMs: number
}

/**
 * Manages device heartbeat functionality with automatic session management.
 *
 * This hook handles periodic "ping" messages to the server to maintain device presence
 * and optionally include location data. The heartbeat system is separate from tracking
 * sessions - heartbeats update a single row per device without creating history.
 *
 * - Automatic heartbeat at configurable intervals
 * - Session token management with automatic cleanup on device changes
 * - Location data inclusion if provided (configurable via SEND_LOCATION_ALWAYS flag)
 * - Graceful cleanup on unmount and beforeunload events
 * - Uses refs to avoid stale closures and minimize effect dependencies
 */

export const useHeartbeat = (options: UseHeartbeatOptions) => {
  const { device, enabled = true, location, intervalMs } = options
  // const { currentLocation } = useDeviceLocation()
  const currentLocation = location

  // ping server for presence heartbeat
  const heartbeat = useMutation(api.devices.heartbeat)
  // for graceful disconnects on unmount or device change
  const disconnect = useMutation(api.devices.disconnect)

  // Centralized state management with useReducer
  const [state, dispatch] = useReducer(heartbeatReducer, {
    state: 'IDLE',
    sessionToken: null,
    isRunning: false,
    lastSentAt: null,
    error: null,
    intervalMs,
  })

  // Core refs for stable access
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const deviceRef = useRef<Device | null | undefined>(null)
  const locationRef = useRef<LocationData | null | undefined>(null)
  // Keep sessionTokenRef only for beforeunload event (needs immediate access)
  const sessionTokenRef = useRef<string | null>(null)

  // --------------------------------------------------------------------------
  // static refs updates

  // Keep refs updated without triggering effects
  useEffect(() => {
    deviceRef.current = device
  }, [device])

  useEffect(() => {
    locationRef.current = currentLocation
  }, [currentLocation])

  useEffect(() => {
    sessionTokenRef.current = state.sessionToken
  }, [state.sessionToken])

  // update interval in state if options change
  useEffect(() => {
    if (intervalMs !== state.intervalMs) {
      dispatch({ type: 'UPDATE_INTERVAL', payload: { intervalMs } })
    }
  }, [intervalMs, state.intervalMs])

  // Handle device changes (reset session)
  // biome-ignore lint/correctness/useExhaustiveDependencies: device._id is THE trigger for the effect
  useEffect(() => {
    const { current: sessionToken } = sessionTokenRef
    if (sessionToken) void disconnect({ sessionToken })
    dispatch({ type: 'REMOVE_SESSION_TOKEN' })
  }, [device?._id, disconnect])

  // ------------

  // Direct heartbeat function using refs (no stale closures)
  const sendHeartbeatDirect = async () => {
    const currentDevice = deviceRef.current
    if (!currentDevice) return

    const currentLocationData = locationRef.current
    const { trackingMode } = currentDevice.settings

    try {
      const shouldIncludeLocation = shouldSendLocation(trackingMode) && currentLocationData

      const result = await heartbeat({
        deviceId: currentDevice._id,
        location: shouldIncludeLocation ? currentLocationData : undefined,
      })
      dispatch({ type: 'HEARTBEAT_SENT' })
      const { sessionToken } = result

      // Update session token if returned from server
      if (sessionToken && sessionToken !== state.sessionToken) {
        dispatch({ type: 'SET_SESSION_TOKEN', payload: { token: sessionToken } })
      }
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }

  // Effect 2: Manage heartbeat based on state only
  // @copilot: Separated interval sync from heartbeat management for cleaner dependencies
  // todo: Now only depends on what it actually needs to manage the interval
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only care if it's there or not
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      dispatch({ type: 'STOP_HEARTBEAT' })
    }

    // Don't start if disabled or no device
    if (!enabled || !device) {
      dispatch({ type: 'STOP_HEARTBEAT' })
      return
    }

    dispatch({ type: 'START_HEARTBEAT', payload: { intervalMs: state.intervalMs } })

    // Send initial heartbeat
    sendHeartbeatDirect()
    intervalRef.current = setInterval(sendHeartbeatDirect, state.intervalMs)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        dispatch({ type: 'STOP_HEARTBEAT' })
        console.log('Heartbeat stopped')
      }
    }
  }, [
    enabled,
    !!device, // Only need to know if device exists, not which device
    state.intervalMs, // Now depends on state instead of device settings
  ])

  // --------------------------------------------------------------------------
  // cleanup stuff

  // graceful disconnect on unmount
  useBeforeUnloadEvent({ sessionTokenRef, disconnect })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // --------------------------------------------------------------------------
  // public api

  // Manual controls for external use (keeping original API)
  const manualSend = () => sendHeartbeatDirect()

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      dispatch({ type: 'STOP_HEARTBEAT' })
      console.log('Heartbeat manually stopped')
    }
  }

  const restart = () => {
    if (device && enabled) {
      stop()
      // const intervalMs = device.settings.heartbeatIntervalMs ?? 60_000

      dispatch({ type: 'START_HEARTBEAT', payload: { intervalMs } })
      sendHeartbeatDirect()
      intervalRef.current = setInterval(sendHeartbeatDirect, intervalMs)
      console.log(`Heartbeat manually restarted with interval: ${intervalMs}ms`)
    }
  }

  return {
    sendHeartbeat: manualSend,
    startHeartbeat: restart,
    stopHeartbeat: stop,
    // Expose state for debugging/monitoring
    state: { ...state },
  }
}

type UseBeforeUnloadEventProps = {
  sessionTokenRef: React.RefObject<string | null>
  disconnect: (args: { sessionToken: string }) => Promise<any>
}

function useBeforeUnloadEvent({ sessionTokenRef, disconnect }: UseBeforeUnloadEventProps) {
  return useWindowEvent('beforeunload', () => {
    const sessionToken = sessionTokenRef.current
    console.log('beforeunload - disconnecting')
    if (sessionToken) {
      void disconnect({ sessionToken })
    }
  })
}
