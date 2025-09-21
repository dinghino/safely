import { useRef, useEffect, useReducer } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'

import { useWindowEvent } from '@/shared/hooks/use-window-event'

import { useDeviceLocation } from '@/features/new-api/location-manager'
import type { LocationData } from '@/features/new-api/location-manager/types'

import type { UseHeartbeatOptions, Device } from './types'
import { heartbeatReducer } from './heartbeat.reducer'

// Heartbeat state management with useReducer
export type HeartbeatState = {
  sessionToken: string | null
  isRunning: boolean
  intervalMs: number
  lastSentAt: number | null
  error: string | null
}

// flag to override internal systems. if this is false, if tracking mode is off
// the heartbeat won't set location
// todo: decide if to keep or move to device settings
const SEND_LOCATION_ALWAYS = true

function shouldSendLocation(trackingMode: string) {
  return SEND_LOCATION_ALWAYS || trackingMode !== 'off'
}

/**
 * Manages device heartbeat functionality with automatic session management.
 *
 * This hook handles periodic "ping" messages to the server to maintain device presence
 * and optionally include location data. The heartbeat system is separate from tracking
 * sessions - heartbeats update a single row per device without creating history.
 *
 * Features:
 * - Automatic heartbeat at configurable intervals (from device settings)
 * - Session token management with automatic cleanup on device changes
 * - Location data inclusion (configurable via SEND_LOCATION_ALWAYS flag)
 * - Graceful cleanup on unmount and beforeunload events
 * - Uses refs to avoid stale closures and minimize effect dependencies
 *
 * Dependencies:
 * - Requires DeviceLocationProvider context for location data
 * - Uses Convex mutations for heartbeat and disconnect operations
 * - Device settings must include heartbeatIntervalMs property
 *
 * The hook uses a two-effect pattern:
 * 1. Effect 1: Syncs device.settings.heartbeatIntervalMs to reducer state
 * 2. Effect 2: Manages heartbeat interval based on state (avoids Convex object deps)
 *
 * State management is handled via useReducer with Redux-style actions for predictable
 * state transitions and better debugging.
 */

export const useHeartbeat = ({ device, enabled = true }: UseHeartbeatOptions) => {
  const { currentLocation } = useDeviceLocation()

  // ping server for presence heartbeat
  const heartbeat = useMutation(api.devices.heartbeat)
  // for graceful disconnects on unmount or device change
  const disconnect = useMutation(api.devices.disconnect)

  // Centralized state management with useReducer
  const [state, dispatch] = useReducer(heartbeatReducer, {
    state: 'IDLE',
    sessionToken: null,
    isRunning: false,
    intervalMs: 60_000,
    error: null,
    lastSentAt: null,
  })

  // Core refs for stable access
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const deviceRef = useRef<Device | null | undefined>(null)
  const locationRef = useRef<LocationData | null>(null)
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

  // Handle device changes (reset session)
  // biome-ignore lint/correctness/useExhaustiveDependencies: device._id is THE trigger for the effect
  useEffect(() => {
    if (sessionTokenRef.current) {
      void disconnect({ sessionToken: sessionTokenRef.current })
    }
    dispatch({ type: 'REMOVE_SESSION_TOKEN' })
  }, [device?._id, disconnect])

  // ------------

  // Direct heartbeat function using refs (no stale closures)
  const sendHeartbeatDirect = async () => {
    const currentDevice = deviceRef.current
    if (!currentDevice) return
    console.log('sending heartbeat...', {
      deviceId: currentDevice._id,
      interval: currentDevice.settings.heartbeatIntervalMs,
    })
    const currentLocationData = locationRef.current
    const { trackingMode } = currentDevice.settings

    try {
      const shouldIncludeLocation = shouldSendLocation(trackingMode) && currentLocationData

      const result = await heartbeat({
        deviceId: currentDevice._id,
        location: shouldIncludeLocation ? currentLocationData : undefined,
      })
      dispatch({ type: 'HEARTBEAT_SENT' })

      // Update session token if returned from server
      if (result?.sessionToken && result.sessionToken !== state.sessionToken) {
        dispatch({ type: 'SET_SESSION_TOKEN', payload: { token: result.sessionToken } })
      }

      console.log(`Heartbeat sent at ${Date.now()}`, {
        trackingMode,
        withLocation: !!shouldIncludeLocation,
        location: currentLocationData,
      })
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }

  // Effect 1: Sync device settings to state
  useEffect(() => {
    if (device?.settings.heartbeatIntervalMs) {
      const intervalMs = device.settings.heartbeatIntervalMs
      console.log(`Device interval settings changed: ${intervalMs}ms`)
      dispatch({ type: 'UPDATE_INTERVAL', payload: { intervalMs } })
    }
  }, [device?.settings.heartbeatIntervalMs])

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
      const intervalMs = device.settings.heartbeatIntervalMs ?? 60_000
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
