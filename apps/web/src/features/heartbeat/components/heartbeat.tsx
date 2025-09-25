'use client'

import { useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useMachine } from '@xstate/react'
import { fromPromise } from 'xstate'

import { api } from '@workspace/backend/api'
import type { LocationData } from '@workspace/geolocation/types'
import { useWindowEvent } from '@/shared/hooks/use-window-event'

import machine from '../machine'
import type { Heartbeat } from '../machine'
import { useGeolocationContext } from '@/features/geolocation'
import { useDeviceId } from '@/shared/hooks/use-device-id'
import { createContext } from '@workspace/react-utils'
import type { Device } from '@/entities/device/types'

export namespace HeartbeatManager {
  export type Actor = Heartbeat.Actor
  export type Send = Heartbeat.Actor['send']
  export type State = Heartbeat.State

  // context value
  export type Value = {
    actor: Actor
    send: Send
    state: State
    status: Device['status']
  }

  export type Props = {
    children?: React.ReactNode
  }
}

const [Provider, useHeartbeat] = createContext<HeartbeatManager.Value>('Heartbeat')

export { useHeartbeat }

/**
 * Heartbeat component - manages heartbeat state machine to communicate with backend
 * and let it know the device is alive and well.
 * Optionally sends location data if available.
 *
 * todo: add location dispatch
 *  - through props
 *  - accessing geolocation context.
 *    - we can subscribe to the actor on location updates and store it locally
 *    - send a getLocation to it to get it back probably.
 *
 *  alternatively we can modify the state machine so that it KNOWS about the geolocation actor
 *  and can use it internally before sending heartbeats, providing the location to
 *  the dispatcher actor as `input`.
 */
export const HeartbeatManager = (props: HeartbeatManager.Props) => {
  const { children } = props

  const [deviceId] = useDeviceId()
  const device = useQuery(api.devices.get, { deviceId })
  const heartbeat = useMutation(api.devices.heartbeat)
  const disconnect = useMutation(api.devices.disconnect)

  const { actor: geolocatorActor } = useGeolocationContext()

  async function dispatcher({ input }: { input: { interval?: number; location?: LocationData } }) {
    if (!device?._id) throw new Error('no deviceId')
    const { sessionToken } = await heartbeat({ deviceId: device._id, ...input })
    return sessionToken
  }
  async function disconnector(options: { input: { token: string } }) {
    const { token: sessionToken } = options.input
    if (!sessionToken) throw new Error('no session token')
    await disconnect({ sessionToken })
  }

  const [state, send, actor] = useMachine(
    machine.provide({
      actors: {
        dispatcher: fromPromise(dispatcher),
        disconnect: fromPromise(disconnector),
      },
    }),
    {
      input: {
        deviceId,
        geolocatorActor,
        interval: device?.settings.heartbeatIntervalMs,
      },
    },
  )

  // update deviceId when it changes. this should never happen in practice
  useEffect(() => send({ type: 'setDeviceId', deviceId }), [deviceId, send])

  // dispatch new interval from device settings
  useEffect(() => {
    const { heartbeatIntervalMs: interval } = device?.settings ?? {}
    if (!interval) return
    send({ type: 'setInterval', interval })
  }, [send, device])

  // send disconnect event when the component unmounts
  useEffect(() => () => send({ type: 'disconnect' }), [send])
  /// before unloading the page, disconnect the device
  useWindowEvent('beforeunload', () => send({ type: 'disconnect' }))

  const value: HeartbeatManager.Value = { actor, send, state, status: device?.status ?? 'unknown' }

  return <Provider value={value}>{children}</Provider>
  // return !!device && <HeartbeatDebugger state={state} actor={actor} send={send} device={device} />
}
