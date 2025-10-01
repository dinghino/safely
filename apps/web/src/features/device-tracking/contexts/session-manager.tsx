'use client'

import { useEffect } from 'react'
import { fromPromise, type ActorRefFrom, type StateFrom } from 'xstate'
import { useMachine, useSelector } from '@xstate/react'

import type { Doc, Id } from '@workspace/backend/dataModel'
import machine, {
  createSettingsFactory,
  // type Geolocator,
  // type Tracking,
} from '@workspace/device-tracking'

import { createContext } from '@workspace/react-utils'
import { useDeviceContext } from '@/features/device-manager'
import { useGeolocationContext } from '@/features/geolocation'

import { useActiveSession, useSendPosition, useStartSession, useStopSession } from '../hooks'

export namespace SessionManager {
  export type Value = {
    actor: ActorRefFrom<typeof machine>
    start: (options?: { deviceId?: Id<'devices'> }) => void
    stop: () => void
    state: StateFrom<typeof machine>
    active: boolean
  }
  export type Props = {
    children?: React.ReactNode
  }
}

const [Provider, useSessionManager] = createContext<SessionManager.Value>('SessionManager')

export { useSessionManager }

const DEFAULT_INTERVAL = 60_000

type DeviceSettings = Doc<'deviceSettings'> | undefined
const parseSettings = createSettingsFactory<DeviceSettings>((settings) => ({
  interval: settings?.updateIntervalMs ?? DEFAULT_INTERVAL,
  trackingMode: settings?.trackingMode ?? 'off',
}))

export const SessionManager: React.FC<SessionManager.Props> = (props) => {
  const { device } = useDeviceContext()
  const activeSession = useActiveSession(device?._id)
  const { actor: geo } = useGeolocationContext()

  const startSession = useStartSession()
  const stopSession = useStopSession()
  const sendPosition = useSendPosition()

  const [state, send, actor] = useMachine(
    machine.provide({
      actors: {
        sendPosition: fromPromise(async ({ input }) => {
          const { timestamp, ...data } = input
          await sendPosition(data)
        }),
        closeSession: fromPromise(async ({ input }) => {
          const { sessionId } = input
          await stopSession({ sessionId })
          return
        }),
        // get a session id from the server or active session and resolve that
        createSession: fromPromise(async () => {
          if (activeSession?._id) return activeSession._id

          if (!device?._id) throw new Error('no device id available to start session')
          // start a new one on the server and get the id back
          const sessionId = await startSession({ deviceId: device?._id })
          return sessionId
        }),

        // fixme: this is ugly. we technically do not need it at least this complex
        // and could just be a fromCallback or just an event dispatch to geo
        // to force a new location fetch.
        getLocation: fromPromise(async ({ input }) => {
          return new Promise((resolve, reject) => {
            const update = geo.on('LOCATION_UPDATE', (event) => {
              unsubscribe()
              resolve(event.data)
            })
            const err = geo.on('ERROR', (event) => {
              unsubscribe()
              console.log('🤬 [session.getLocation] geo error on geolocation')
              reject(event.error)
            })
            const unsubscribe = () => {
              update.unsubscribe()
              err.unsubscribe()
            }
            geo.send({ type: 'GET_POSITION', options: input })
          })
        }),
      },
    }),
    {
      input: {
        geolocatorActor: geo,
        settings: parseSettings(device?.settings),
      },
      inspect: (event) => {
        // const a: (typeof event)['type'][] = ['@xstate.event'] as const
        if (event.type === '@xstate.event') {
          if (event.type.startsWith('xstate.')) return // ignore internal events
          console.log('[xstate][session manager]', event.event)
        }
      },
    },
  )

  // log any errors from the state machine
  // todo: remove once we're stable
  useEffect(() => {
    const logging = actor.on('error', (event) => {
      console.log('🤬🤬🤬 tracking session error', event)
    })
    return () => {
      logging.unsubscribe()
    }
  }, [actor])

  const settings = useSelector(actor, (state) => state.context.settings)

  // update machine settings when device settings change
  useEffect(() => {
    // todo: make comparison cleaner
    if (JSON.stringify(parseSettings(device?.settings)) === JSON.stringify(settings)) return
    send({ type: 'update_settings', settings: parseSettings(device?.settings) })
  }, [device?.settings, settings, send])

  // --------------------------------------------------------------------------
  // machine state values

  // the session id the machine is working on if set
  const knownSessionId = useSelector(actor, (state) => state.context.sessionId)
  const isWorking = useSelector(actor, (state) => state.matches('working'))
  const isStopping = useSelector(actor, (state) => state.matches({ working: 'stopping' }))

  // --------------------------------------------------------------------------
  // main effect to handle session changes

  // update the active session when it changes and eventually start/stop the machine
  useEffect(() => {
    const sessionId = activeSession?._id
    if (sessionId && sessionId === knownSessionId) return // nothing to do

    if (isStopping) return // do not interfere when stopping

    // if we don't have an id tell the machine to stop. it will be idempotent
    // if the current state doesn't handle stop events
    if (!sessionId) return send({ type: 'stop' })

    // we got a new session id from the server. tell the machine to work.
    // this should be idempotent if the machine is already working on something
    return send({ type: 'start', sessionId: sessionId })
  }, [activeSession?._id, send, knownSessionId, isStopping])

  // todo: this should just send the event to the machine that should handle
  // creating the session with the startSession actor if required
  const start = async ({ deviceId }: { deviceId?: Id<'devices'> } = {}) => {
    // handle starting a session for another device by requesting a new session
    // for that device to the server, then bail.
    if (deviceId && deviceId !== device?._id) {
      return startSession({ deviceId })
    }
    // if the state machine is working already there's nothing to do. start
    // should technically be idempotent and disabled
    if (isWorking) return
    if (!device?._id) {
      console.error(
        `[SessionManager] attempting to start session on this device but we have no device id.
          Maybe the device is not registered with the application yet?
          `,
      )
      return
    }
    // notify we want to start for this device. the machine will handle creating
    // the session on the server if it doesn't already have a known session.
    // see the startSession actor.
    return send({ type: 'start' })
  }

  const value: SessionManager.Value = {
    actor,
    state,
    active: isWorking,
    start,
    stop: () => send({ type: 'stop' }),
  }

  return <Provider value={value}>{props.children}</Provider>
}
