/** @format */

import { createContext, useContext, useReducer } from 'react'
import type { Location } from 'react-native-background-geolocation'
export namespace Geolocation {
  export type Event<T = any> = {
    timestamp: number
    name: string
    data: T
  }
  export type State = { enabled: boolean; debug: boolean | undefined }
  export type InternalState = {
    state: State
    locations: Location[]
    events: Geolocation.Event[]
    lastLocation: Location | null
  }

  export type Action =
    | { type: 'update'; payload: Partial<Geolocation.State> }
    | { type: 'location'; payload: Location }
    | { type: 'clear'; payload?: undefined }
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
  switch (type) {
    case 'update':
      return { ...prev, state: { ...prev.state, ...payload } }
    case 'location':
      return {
        ...prev,
        locations: [...prev.locations, payload],
        lastLocation: payload,
      }
    case 'clear':
      return {
        ...prev,
        locations: [],
      }
    case 'event':
      return {
        ...prev,
        events: [...prev.events, { ...payload, timestamp: Date.now() }],
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

export const action = {
  update: (payload: Geolocation.Payload<'update'>): Geolocation.Action => ({
    type: 'update',
    payload,
  }),
  location: (payload: Geolocation.Payload<'location'>): Geolocation.Action => ({
    type: 'location',
    payload,
  }),
  clear: (): Geolocation.Action => ({ type: 'clear' }),
  event: (payload: Geolocation.Payload<'event'>): Geolocation.Action => ({
    type: 'event',
    payload,
  }),
  clearEvents: (): Geolocation.Action => ({ type: 'clear_events' }),
}
