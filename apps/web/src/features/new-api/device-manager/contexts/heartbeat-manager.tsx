'use client'

import { useRef, useEffect, type ActionDispatch } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'
// import { createContext } from '@workspace/react-utils'

import type { Device } from '@/entities/device/types'
import { useWindowEvent } from '@/shared/hooks/use-window-event'
import { useConditionalInterval } from '@/shared/hooks/use-conditional-interval'

import type { LocationData } from '../../location-manager/types'
import { useDeviceLocation } from '../../location-manager'

import useHeartbeatState, { type HeartbeatAction, type HeartbeatState } from '../state/heartbeat'
import { useDeviceContext } from './device.context'

// type HeartbeatContextValue = {
//   enabled: boolean
//   toggleHeartbeat: (enabled?: boolean) => void
// }

// const [HeartbeatContext, useHeartbeatContext] =
//   createContext<HeartbeatContextValue>('HeartbeatContext')

// export { useHeartbeatContext }

// flag to override internal systems. if this is false, if tracking mode is off
// the heartbeat won't set location
// todo: decide if to keep or move to device settings
const SEND_LOCATION_ALWAYS = true

function shouldSendLocation(trackingMode: string) {
  return SEND_LOCATION_ALWAYS || trackingMode !== 'off'
}

export namespace HeartbeatManager {
  export type Props = {
    // children: React.ReactNode
  }
}

// export const HeartbeatProvider: React.FC<HeartbeatProvider.Props> = ({ children }) => {
export const HeartbeatManager: React.FC<HeartbeatManager.Props> = () => {
  const { device } = useDeviceContext()
  const { startWatching, isWatching } = useDeviceLocation()

  const [state, dispatch] = useHeartbeatState()

  const disconnect = useMutation(api.devices.disconnect)

  // Keep sessionTokenRef only for beforeunload event (needs immediate access)
  const sessionTokenRef = useRef<string | null>(null)

  // ensure the location watcher is started if device is present - every known
  // device that has been registered should have a last known position sent
  // (unless user denies or hardware doesn't support)
  useEffect(() => {
    if (!isWatching && device?._id) {
      startWatching({ highAccuracy: false })
    }
  }, [isWatching, startWatching, device?._id])

  // sync state and refs when internals change to avoid stale closures
  useEffect(() => {
    const intervalMs = device?.settings.heartbeatIntervalMs || 60_000
    if (intervalMs !== state.intervalMs) {
      dispatch({ type: 'UPDATE_INTERVAL', payload: { intervalMs } })
    }
  }, [device?.settings.heartbeatIntervalMs, state.intervalMs, dispatch])

  useEffect(() => {
    sessionTokenRef.current = state.sessionToken
  }, [state.sessionToken])

  // start/stop heartbeat based on device presence in the system - i.e. if the
  // device has been registered on the backend or not
  useEffect(() => {
    if (!device?._id && state.isRunning) {
      return dispatch({ type: 'STOP_HEARTBEAT' })
    }
    if (device?._id && !state.isRunning) {
      const intervalMs = state.intervalMs
      return dispatch({ type: 'START_HEARTBEAT', payload: { intervalMs } })
    }
  }, [device?._id, state.intervalMs, state.isRunning, dispatch])

  // actual heartbeat function
  const sendHeartbeat = useHeartbeatFunction({ state, dispatch })

  // run the heartbeat call conditionally every intervalMs time
  useConditionalInterval({
    intervalMs: state.intervalMs,
    func: sendHeartbeat,
    enabled: state.isRunning || !!device,
  })
  useBeforeUnloadEvent({ sessionTokenRef, disconnect })

  return null

  // ------------------------------------------------------------------
  // these are if we want to toggle back this component as a context provider

  // const toggleHeartbeat = useCallback(
  //   (newValue?: boolean) => {
  //     const shouldStart = newValue !== undefined ? newValue : !enabled
  //     if (!shouldStart) return dispatch({ type: 'STOP_HEARTBEAT' })
  //     return dispatch({ type: 'START_HEARTBEAT', payload: { intervalMs: state.intervalMs } })
  //   },
  //   [enabled, state.intervalMs],
  // )

  // const value = {
  //   enabled: state.isRunning,
  //   toggleHeartbeat,
  // }
  // return <HeartbeatContext value={value}>{children}</HeartbeatContext>
}

type HeartbeatOptions = {
  state: HeartbeatState
  dispatch: ActionDispatch<[action: HeartbeatAction]>
}

function useHeartbeatFunction(options: HeartbeatOptions) {
  const { state, dispatch } = options
  const heartbeat = useMutation(api.devices.heartbeat)

  const { device } = useDeviceContext()
  const { currentLocation } = useDeviceLocation()

  const deviceRef = useRef<Device | null | undefined>(null)
  const locationRef = useRef<LocationData | null | undefined>(null)

  useEffect(() => {
    deviceRef.current = device
  }, [device])
  useEffect(() => {
    locationRef.current = currentLocation
  }, [currentLocation])

  // actual heartbeat function
  const sendHeartbeat = async () => {
    const currentDevice = deviceRef.current
    if (!currentDevice) return

    const currentLocationData = locationRef.current
    const { trackingMode } = currentDevice.settings

    if (state.state === 'SENDING') return

    try {
      dispatch({ type: 'SENDING_HEARTBEAT' })
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
  return sendHeartbeat
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
