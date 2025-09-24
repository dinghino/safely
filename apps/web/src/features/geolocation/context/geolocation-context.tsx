'use client'

import { useMachine, useSelector } from '@xstate/react'
import { createContext } from '@workspace/react-utils'

// import geolocation, { type Locator, type LocationMachine } from '@/lib/geolocation'
import geolocation from '@workspace/geolocation'
import type { Locator, LocationMachine } from '@workspace/geolocation/types'
import { BrowserGeolocationProvider } from '../services'

export namespace GeolocationProvider {
  export type Context = {
    send: LocationMachine.Actor['send']
    state: ReturnType<LocationMachine.Actor['getSnapshot']>
    actor: LocationMachine.Actor
    current: Locator.Data | null
    timestamp: number
    getLocation: (options: Locator.Options) => void
    startWatching: () => void
    stopWatching: () => void
  }
  export type Props = { children: React.ReactNode }
}

const [Provider, useGeolocationContext] =
  createContext<GeolocationProvider.Context>('GeolocationContext')

export { useGeolocationContext }

const service = new BrowserGeolocationProvider()

export const GeolocationProvider: React.FC<GeolocationProvider.Props> = ({ children }) => {
  const [state, send, actor] = useMachine(geolocation, {
    input: {
      service,
      maxAge: 10 * 60 * 1000, // 10m
    },
  })

  const current = useSelector(actor, (state) => state.context?.data ?? null)
  const timestamp = useSelector(actor, (state) => state.context?.timestamp ?? -1)

  // todo: add options for watch
  const getLocation = (options: Locator.Options) => send({ type: 'GET_POSITION', options })
  const startWatching = () => send({ type: 'START_WATCHING' })
  const stopWatching = () => send({ type: 'STOP_WATCHING' })

  const value = {
    state,
    send,
    actor,
    current,
    timestamp,
    getLocation,
    startWatching,
    stopWatching,
  } satisfies GeolocationProvider.Context

  return <Provider value={value}>{children}</Provider>
}
