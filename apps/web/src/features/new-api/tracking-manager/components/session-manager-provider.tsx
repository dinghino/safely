'use client'

import { useEffect, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useMachine } from '@xstate/react'
import { api } from '@workspace/backend/api'

import { useDeviceContext } from '../../device-manager'

import { SessionManagerContext } from '../contexts'
import type { SessionManagerProvider } from '../types'
import { activeSessionManager } from '../lib/state'
import type { Id } from '@workspace/backend/dataModel'

// @copilot: This component has complex useEffect dependencies and state management
// todo: Consider using useReducer for state management and splitting complex effects
export const SessionProvider: React.FC<SessionManagerProvider.Props> = (props) => {
  const { children } = props
  const { device } = useDeviceContext()

  const activeSession = useQuery(api.tracking.getActiveSession, { deviceId: device?._id })

  const sendPosition = useMutation(api.tracking.addLocationPoint)
  // const [_, stopSession] = useSessionControls()
  const stopSession = useMutation(api.tracking.stopSession)
  const closeSession = async (opts: { sessionId: Id<'trackSession'> }) => stopSession(opts)

  const [state, send] = useMachine(activeSessionManager, {
    input: {
      sessionId: activeSession?._id,
      updateTimeout: device?.settings.updateIntervalMs,
      sendPosition,
      closeSession,
    },
    // // temporary debugger
    // inspect: (data) => {
    //   const events: Array<(typeof data)['type']> = ['@xstate.action', '@xstate.event']
    //   if (!events.includes(data.type)) return
    //   console.log('👷‍♂️ inspector', data)
    // },
  })

  useEffect(() => {
    console.log('🍍 [session xstate] state changed to', state.value)
  }, [state.value])

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
    if (!activeSession?._id) return send({ type: 'STOP_SESSION' })
    send({ type: 'SET_SESSION', payload: { sessionId: activeSession._id } })
  }, [activeSession?._id, send])

  const isTracking = useMemo(() => state?.matches?.('active'), [state])

  const value: SessionManagerProvider.Value = {
    activeSession: activeSession ?? null,
    isTracking,
    error: null,
    startSession: () => send({ type: 'START_SESSION' }),
    stopSession: () => send({ type: 'STOP_SESSION' }),
  }

  return <SessionManagerContext value={value}>{children}</SessionManagerContext>
}

// function useSessionControls() {
//   const { device } = useDeviceContext()

//   const startSessionMutation = useMutation(api.tracking.startSession)
//   const closeSession = useMutation(api.tracking.stopSession)

//   const startSession = async () => {
//     if (!device?._id) return false // cant start a session on a non-registered device
//     const sessionId = await startSessionMutation({ deviceId: device._id })
//     if (!sessionId) return false
//     return sessionId
//   }
//   const stopSession = async (opts: { sessionId: Id<'trackSession'> }) =>  closeSession(opts)
//   return [startSession, stopSession] as const
// }
