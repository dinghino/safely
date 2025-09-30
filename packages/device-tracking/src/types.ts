import type { CallbackActorLogic, PromiseActorLogic } from 'xstate'
import type { Id } from '@workspace/backend/dataModel'
import type { LocationMachine, Locator } from '@workspace/geolocation/types'

export namespace Geolocator {
  export type Data = Locator.Data
  export type Options = Locator.Options
  export type Actor = LocationMachine.Actor
}

export namespace Tracking {
  type SessionId = Id<'trackSession'>

  export type Settings = {
    interval: number // in ms
    trackingMode: 'active' | 'off' | 'passive' | 'aggressive'
  }

  export type Inputs = {
    geolocatorActor: Geolocator.Actor
    settings: Settings
  }

  export type Context = Inputs & {
    sessionId: SessionId | null | undefined
    interval: number // in ms
    lastLocation: Geolocator.Data | null
    options: Geolocator.Options
    lastSentMs: number | undefined
    canGeolocate: boolean
    ready?: boolean
    error: string | null
  }

  export type Events =
    | { type: 'setup_done' }
    // actively start a session
    | { type: 'start'; sessionId: SessionId | undefined }
    // stop and close the active session
    | { type: 'stop' }
    // request a session to be started
    // todo: implement requests on backend
    // todo: { requestId: Id<'trackingRequests'> }
    /**
     * | { type: 'handle_request_session'; requestId: string }
     */
    // explicitly set the geolocator options
    | { type: 'update_settings'; settings: Partial<Settings> }
    // --
    // callback event for getLocation actor (?) or external setter
    | { type: 'set_location'; location: Geolocator.Data }
    // internal event linking state of the actors
    | { type: 'can_geolocate'; canGeolocate: boolean }
    // set an existing session id to work on - this should not be handled when we are already working
    // | { type: 'set_session'; sessionId: SessionId }

  export type Emitted =
    // emit when the state machine is ready to work on active sessions
    | { type: 'ready' }
    // whenever we are in an error state we should emit this
    | { type: 'error'; error: any }
    // when we're about to start working on a session. this includes setting up
    // a new session on the server, resolving the initial setup for it etc.
    // todo: this should be emitted when we add the system to **request** a session
    // to the server instead of just spawning one.
    | { type: 'starting' }
    // emitted when we are in the main machine loop and actively tracking a session
    | { type: 'started' }
    // whenever we send a location point to the server we should emit this event
    | { type: 'sent'; payload: any }
    // when we are about to stop tracking the active session, requesting close to the server
    | { type: 'stopping' }
    // emitted when we stop tracking the active session
    | { type: 'stopped' }

  export type Actors = {
    /**
     * Setup actor that hooks up events between geolocator actor and this machine.
     */
    setup: CallbackActorLogic<
      Extract<Events, { type: 'set_location' | 'can_geolocate' }>,
      { service: Geolocator.Actor }
    >
    /**
     * Actor that resolves with a active tracking session id.
     * It should either return an existing active session id or run a mutation
     * to start a new session.
     * @deprecated we create sessions with requests api from outside
     */
    // createSession: PromiseActorLogic<void, void>
    // createSession: PromiseActorLogic<SessionId, void>
    /**
     * Actor that closes the active session on the server.
     * It should resolve once the session is closed.
     * @todo remove session id from the promise input
     * @deprecated with requests api. we handle closing from outside
     */
    // closeSession: PromiseActorLogic<void, { sessionId: SessionId }>
    /**
     * This **might** not be even needed, but should be called when we are
     * about to dispatch a new location to the server, to ensure we have latest
     * location data available to send.
     * 
     * @todo since we are already able to listen to location updates from the
     * geolocator actor, we do not need this to return a location (maybe `sendBack`)
     * but we might want to dispatch a GET_LOCATION event to the actor so that we
     * can ensure we have the latest location data.
     */
    getLocation: PromiseActorLogic<Geolocator.Data, Geolocator.Options>
    // getLocation: PromiseActorLogic<void, Geolocator.Options>
    /**
     * promise actor that should call the server to add a location point to
     * the provided session id locations data.
     * matches what we have in `packages/backend/convex/tracking.ts#addLocationPoint`
     */
    sendPosition: PromiseActorLogic<void, Geolocator.Data & { sessionId: SessionId }>
  }
}
