import type { ActorRefFrom, ActorLogicFrom } from 'xstate'
import type { Locator } from '../lib/locator.types'
import type { machine } from './machine'

export namespace LocationMachine {
  export type Actor = ActorRefFrom<typeof machine>
  export type Logic = ActorLogicFrom<typeof machine>

  export type Inputs = { service: Locator.Provider; maxAge?: number }

  export type Context = {
    service: Locator.Provider
    data: Locator.Data | null
    error: string | null
    watchId: number | null
    timestamp: number
    maxAge: number
    permissionStatus?: Locator.Status
    retryCount: number
  }
  export type Event =
    | { type: 'REQUEST_PERMISSION' }
    | { type: 'PERMISSION_GRANTED' }
    | { type: 'PERMISSION_DENIED' }
    | { type: 'START_WATCHING'; options?: Locator.Options }
    | { type: 'STOP_WATCHING' }
    | { type: 'GET_POSITION'; options?: Locator.Options }
    // for internal use by the watch actor
    | { type: 'WATCH_STARTED'; watchId: number }
    | { type: 'WATCH_UPDATE'; data: Locator.Data }
    | { type: 'WATCH_ERROR'; error: Locator.LocatorError }
    | { type: 'RESTART' }

  export type Emitted =
    // emitted when the machine is ready to accept commands
    | { type: 'READY' }
    // watching has started, todo: add watchId? we technically don't need to expose it?
    | { type: 'WATCHING' }
    | { type: 'STOPPED_WATCHING' }
    // send whenever a new location is available to subscribers
    | { type: 'LOCATION_UPDATE'; data: Locator.Data }
    // notify of errors with a message. todo: define error codes? we can use the state value to determine type
    | { type: 'ERROR'; error: string }
}
