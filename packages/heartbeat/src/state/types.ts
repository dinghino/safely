// import type { LocationMachine } from '@workspace/geolocation'
// import type { Locator } from '@workspace/geolocation/types'
import type {
  ActorRefFromLogic,
  StateFrom,
  PromiseActorLogic,
  CallbackActorLogic,
  ActorRef,
} from 'xstate'
import type machine from './heartbeat.machine'
import type { LocationMetadata } from '@workspace/backend/types'

/**
 * This is a minimal interface of the same type exported from the @workspace/geolocation
 * package and contains only the types we need to interact with it.
 * We do this to avoid a hard dependency on that package, allowing
 * this package to be used standalone if needed.
 *
 * @note this might get even lighter if we decide to split the initialization function
 * from being an internally defined service (see `Heartbeat.Actors.setup` with
 * the implementation in the actors.ts file), forcing the user to set up
 * the system when consuming the machine, removing the need to know about
 * the geolocation state machine completely, and only leaving the data type
 * (at most) which comes from the backend anyway.
 */
export namespace Geolocator {
  export type Data = {
    point: { latitude: number; longitude: number }
    metadata: LocationMetadata
    timestamp: number
  }
  export type Options = Partial<{
    enableHighAccuracy: boolean
    maximumAge: number
    timeout: number
  }>

  // state machine minimal interface
  export type Snapshot = any
  export type Events = { type: 'GET_POSITION'; options: Options }
  export type Emitted =
    | { type: 'READY' }
    | { type: 'LOCATION_UPDATE'; data: Data }
    /**
     * these two we technically don't need but typescript complains if they are missing
     * @note this might be a typing issue on xstate, since it should be possible to have
     * a machine ref for only the emitted events we care about
     */
    | { type: 'WATCHING' }
    | { type: 'ERROR'; error: string }

  export type Actor = ActorRef<Snapshot, Events, Emitted>
}

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
    geolocatorActor: Geolocator.Actor // LocationMachine.Actor
  }
  export type Context = Input & {
    interval: number
    lastHeartbeat: number | null
    token: string | null
    retryCount: number
    maxRetries: number
    position: Geolocator.Data | null
    canGeolocate: boolean
  }
  export type Events =
    | { type: 'start' }
    | { type: 'stop' }
    | { type: 'setDeviceId'; deviceId: string }
    | { type: 'setInterval'; interval: number }
    | { type: 'disconnect' }
    // location values
    | { type: 'locationUpdate'; location: Geolocator.Data }
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
      { service: Geolocator.Actor }
    >
  }

  export namespace Dispatcher {
    export type Input = {
      interval?: number
      location?: Omit<Geolocator.Data, 'timestamp'>
    }
  }
}
export type Internal<T extends Heartbeat.Events['type']> = Extract<Heartbeat.Events, { type: T }>
export type Emitted<T extends Heartbeat.Emitted['type']> = Extract<Heartbeat.Emitted, { type: T }>
