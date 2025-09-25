import type { LocationMachine } from '@workspace/geolocation'
import type { Locator } from '@workspace/geolocation/types'
import type { ActorRefFromLogic, StateFrom, PromiseActorLogic, CallbackActorLogic } from 'xstate'
import type machine from './heartbeat.machine'

export namespace Heartbeat {
  export type Actor = ActorRefFromLogic<typeof machine>
  export type State = StateFrom<typeof machine>

  export type Input = {
    deviceId: string // todo: Id<'devices'> ?
    interval?: number // in ms
    // todo: make the type looser, with only the events we care about
    //       doing so might break the relationship, but could give us benefit of
    //       using a different actor if we need to.
    // todo: completely remove (see below on `linkGeolocator`)
    geolocatorActor: LocationMachine.Actor
  }
  export type Context = Input & {
    interval: number
    lastHeartbeat: number | null
    token: string | null
    retryCount: number
    maxRetries: number
    position: Locator.Data | null
    canGeolocate: boolean
  }
  export type Events =
    | { type: 'start' }
    | { type: 'stop' }
    | { type: 'setDeviceId'; deviceId: string }
    | { type: 'setInterval'; interval: number }
    | { type: 'disconnect' }
    // location values
    | { type: 'locationUpdate'; location: Locator.Data }
    | { type: 'canGeolocate' }
    // develop
    | { type: 'clear' }

  export type Emitted =
    | { type: 'started' }
    | { type: 'stopped' }
    | { type: 'heartbeat' }
    | { type: 'disconnected' }
    | { type: 'retrying'; attempt: number }
    | { type: 'intervalChanged'; interval: number }
    | { type: 'error'; message: string }

  export type Actors = {
    /** sends the heartbeat and returns the session token */
    dispatcher: PromiseActorLogic<string, Dispatcher.Input>
    /**
     * disconnects the device from the heartbeat
     * @note this should be called on `beforeunload` when possible to a graceful disconnect
     * and can be called manually by sending the `disconnect` event
     */
    disconnect: PromiseActorLogic<void, { token: string }>
    /**
     * Used in init to set up the geolocation event listeners
     */
    setup: CallbackActorLogic<
      Internal<'locationUpdate' | 'canGeolocate' | 'locationUpdate'>,
      { service: LocationMachine.Actor }
    >
  }

  export namespace Dispatcher {
    export type Input = {
      interval?: number
      location?: Omit<Locator.Data, 'timestamp'>
    }
  }
}
export type Internal<T extends Heartbeat.Events['type']> = Extract<Heartbeat.Events, { type: T }>
export type Emitted<T extends Heartbeat.Emitted['type']> = Extract<Heartbeat.Emitted, { type: T }>
