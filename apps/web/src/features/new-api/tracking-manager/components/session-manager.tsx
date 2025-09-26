'use client'

import { useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useMachine } from '@xstate/react'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'

import { useDeviceContext } from '@/features/device-manager'
import { activeSessionManager } from '../lib/state'
import { useGeolocationContext } from '@/features/geolocation'

export namespace SessionManager {
  export type Props = {}
}
/**
 * Client component that handles tracking the (optional) active session for the
 * current device and sends location updates as needed to the backend.
 */
export const SessionManager: React.FC<SessionManager.Props> = () => {
  const { device } = useDeviceContext()

  const session = useQuery(api.tracking.getActiveSession, { deviceId: device?._id })

  const sendPosition = useMutation(api.tracking.addLocationPoint)
  const stopSession = useMutation(api.tracking.stopSession)
  const closeSession = async (opts: { sessionId: Id<'trackSession'> }) => stopSession(opts)

  const { actor: locationActor } = useGeolocationContext()
  const [state, send] = useMachine(activeSessionManager, {
    input: {
      locationActor,
      sessionId: session?._id,
      updateTimeout: device?.settings.updateIntervalMs,
      sendPosition,
      closeSession,
    },
  })

  // stop the session if device is removed
  useEffect(() => {
    // stop if no device (unregistered) and we are actively tracking
    if (!device && state.matches('active')) send({ type: 'STOP_SESSION' })
  }, [device, state, send])

  /// update state machine settings when device settings change
  useEffect(() => {
    const interval = device?.settings.updateIntervalMs
    if (!interval) return
    send({ type: 'UPDATE_SETTINGS', payload: { interval } })
  }, [device?.settings.updateIntervalMs, send])

  // update the active session when it changes
  // if no session available, stop the state machine
  useEffect(() => {
    if (!session?._id) {
      if (state.matches('active')) send({ type: 'STOP_SESSION' })
      return
    }
    send({ type: 'SET_SESSION', payload: { sessionId: session._id } })
  }, [session?._id, send, state])

  return null
}
