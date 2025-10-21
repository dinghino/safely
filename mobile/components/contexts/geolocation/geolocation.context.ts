/** @format */

import { createContext, useContext, useReducer } from 'react'
import type { Location, State as BGState } from 'react-native-background-geolocation'
export namespace Geolocation {
  export type Event<T = any> = {
    timestamp: number
    name: string
    data: T
  }
  export type State = Partial<BGState>

  export type InternalState = {
    state: State
    locations: Location[]
    events: Geolocation.Event[]
    lastLocation: Location | null
  }

  export type Action =
    | { type: 'update'; payload: Partial<Geolocation.State> }
    | { type: 'location'; payload: Location }
    | { type: 'clear_locations'; payload?: undefined }
    | { type: 'event'; payload: Omit<Geolocation.Event, 'timestamp'> }
    | { type: 'clear_events'; payload?: undefined }

  export type ActionType = Geolocation.Action['type']
  export type Payload<K extends ActionType> = Extract<Geolocation.Action, { type: K }>['payload']

  export type Context = InternalState & {
    // state: State; // bg geolocation state
    locations: Location[]
    dispatch: React.ActionDispatch<[Action]>
    clearLocations: () => void
    clearEvents: () => void
  }

  export type Dispatcher = React.ActionDispatch<[Action]>
}

const initialState: Geolocation.InternalState = {
  state: {
    enabled: false,
    debug: false,
  },
  locations: [],
  events: [],
  lastLocation: null,
}
// todo: use our custom createContext utility from react-utils
export const GeolocationContext = createContext<Geolocation.Context>({} as Geolocation.Context)

export function useGeolocation() {
  const context = useContext(GeolocationContext)
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider')
  }
  return context
}

function reducer(
  prev: Geolocation.InternalState,
  event: Geolocation.Action,
): Geolocation.InternalState {
  const { type, payload } = event
  // console.log('[GeolocationReducer] action:', type, payload)
  function makeEvent(name: string, data: any): Geolocation.Event {
    const timestamp = Date.now()
    return { timestamp, name, data }
  }

  switch (type) {
    case 'update':
      return {
        ...prev,
        state: { ...prev.state, ...payload },
        events: [...prev.events,
          // makeEvent('🛠️ update', payload)
        ],
      }
    case 'location': {
      // avoid duplicate locations in case of multiple samples with same uuid
      const uuid = payload.uuid
      const exists = prev.locations.find((loc) => loc.uuid === uuid)
      if (exists) {
        return { ...prev }
      }
      return {
        ...prev,
        locations: [...prev.locations, payload],
        lastLocation: payload,
        events: [...prev.events, makeEvent('📍 location', payload)],
      }
    }
    case 'event': {
      const { name, data } = payload
      return {
        ...prev,
        events: [...prev.events, makeEvent(name, data)],
      }
    }
    case 'clear_locations':
      return {
        ...prev,
        locations: [],
      }
    case 'clear_events':
      return {
        ...prev,
        events: [],
      }
    default:
      return prev
  }
}

export function useGeolocationReducer() {
  return useReducer(reducer, initialState)
}

type ActionBuilder<K extends Geolocation.ActionType> = (
  // biome-ignore lint/suspicious/noConfusingVoidType: intended to allow no payload
  payload: Geolocation.Payload<K> extends undefined ? void : Geolocation.Payload<K>,
) => Extract<Geolocation.Action, { type: K }>

function makeAction<K extends Geolocation.ActionType>(type: K): ActionBuilder<K> {
  return (payload: any) => ({ type, payload }) as Extract<Geolocation.Action, { type: K }>
}

export const action = {
  update: makeAction('update'),
  location: makeAction('location'),
  clear: makeAction('clear_locations'),
  event: makeAction('event'),
  clearEvents: makeAction('clear_events'),
} satisfies Record<string, ActionBuilder<any>>
