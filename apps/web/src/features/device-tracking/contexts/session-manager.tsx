'use client'

import { useEffect } from 'react'
import { fromPromise, type ActorRefFrom, type StateFrom } from 'xstate'
import { useMachine, useSelector } from '@xstate/react'

import type { Doc } from '@workspace/backend/dataModel'
import machine, {
  createSettingsFactory,
  // type Geolocator,
  // type Tracking,
} from '@workspace/device-tracking'

import { createContext } from '@workspace/react-utils'
import { useDeviceContext } from '@/features/device-manager'
import { useGeolocationContext } from '@/features/geolocation'

import {
  useAcknowledgeRequest,
  useActiveRequest,
  useActiveSession,
  useSendPosition,
} from '../hooks'

export namespace SessionManager {
  export type Value = {
    actor: ActorRefFrom<typeof machine>
    // start: (options?: { deviceId?: Id<'devices'> }) => void
    // stop: () => void
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
  const { actor: geo } = useGeolocationContext()

  const trackingRequest = useActiveRequest({ deviceId: device?._id })
  const activeSession = useActiveSession(device?._id)

  const sendPosition = useSendPosition()
  const acknowledge = useAcknowledgeRequest()

  const [state, send, actor] = useMachine(
    machine.provide({
      actors: {
        sendPosition: fromPromise(async ({ input }) => {
          const { timestamp, ...data } = input
          await sendPosition(data)
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

  // --------------------------------------------------------------------------
  // machine state values

  // the session id the machine is working on if set
  const knownSessionId = useSelector(actor, (state) => state.context.sessionId)
  const isWorking = useSelector(actor, (state) => state.matches('working'))
  const isStopping = useSelector(actor, (state) => state.matches({ working: 'stopping' }))
  const settings = useSelector(actor, (state) => state.context.settings)

  // --------------------------------------------------------------------------
  // effects

  // todo: move inside state machine ?:122
  useEffect(() => {
    if (!trackingRequest) return
    const { _id: requestId, target } = trackingRequest
    if (target !== device?._id) return // not for us
    acknowledge({ requestId })
  }, [trackingRequest, acknowledge, device?._id])

  // update machine settings when device settings change
  useEffect(() => {
    // fixme: make comparison cleaner
    if (JSON.stringify(parseSettings(device?.settings)) === JSON.stringify(settings)) return
    send({ type: 'update_settings', settings: parseSettings(device?.settings) })
  }, [device?.settings, settings, send])

  useEffect(() => {
    const sessionId = activeSession?._id

    if (sessionId && sessionId === knownSessionId) return // nothing to do

    if (sessionId) send({ type: 'start', sessionId })
    // sessionId = null|undefined so we need to stop the machine
    else if (!isStopping) send({ type: 'stop' })
  }, [activeSession?._id, knownSessionId, send, isStopping])

  const value: SessionManager.Value = {
    actor,
    state,
    active: isWorking,
  }

  return <Provider value={value}>{props.children}</Provider>
}
