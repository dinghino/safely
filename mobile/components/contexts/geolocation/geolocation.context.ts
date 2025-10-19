/** @format */

import { createContext, useContext, useReducer } from 'react'
import type { Location } from 'react-native-background-geolocation'

export type ContextEvent<T = any> = {
  timestamp: number
  type: string
  data: T
}

export type LocalState = {
  state: { enabled: boolean; debug: boolean | undefined }
  locations: Location[]
  events: ContextEvent[]
}

export type Action =
  | { type: 'update'; payload: Partial<LocalState['state']> }
  | { type: 'location'; payload: Location }
  | { type: 'clear'; payload?: undefined }
  | { type: 'add_event'; payload: ContextEvent }
  | { type: 'clear_events'; payload?: undefined }

export type GeolocationContext = LocalState & {
  // state: State; // bg geolocation state
  locations: Location[]
  dispatch: React.Dispatch<Action>
  clearLocations: () => void
  clearEvents: () => void
}

const initialState: LocalState = {
  state: {
    enabled: false,
    debug: false,
  },
  locations: [],
  events: [],
}

export const GeolocationContext = createContext<GeolocationContext>({} as GeolocationContext)

export function useGeolocation() {
  return useContext(GeolocationContext)
}

function reducer(prev: LocalState, { type, payload }: Action): LocalState {
  console.log('[GeolocationReducer] action:', type, payload)
  switch (type) {
    case 'update':
      return { ...prev, state: { ...prev.state, ...payload } }
    case 'location':
      return {
        ...prev,
        locations: [...prev.locations, payload],
      }
    case 'clear':
      return {
        ...prev,
        locations: [],
      }
    case 'add_event':
      return {
        ...prev,
        events: [...prev.events, payload],
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
