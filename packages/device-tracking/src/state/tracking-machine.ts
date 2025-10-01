import { assign, emit, fromCallback, setup, log } from 'xstate'
// biome-ignore lint/correctness/noUnusedImports: cannot infer machine type without this
import type { Guard } from 'xstate/guards'

import { updateGeolocatorOptions, createContext, setupEventListeners, guards } from '../lib'
import type { Tracking } from '../types'

const config = setup({
  types: {
    input: {} as Tracking.Inputs,
    context: {} as Tracking.Context,
    events: {} as Tracking.Events,
    emitted: {} as Tracking.Emitted,
  },
  actors: {
    setup: fromCallback(setupEventListeners),
  } as Tracking.Actors,
  guards: {
    freshPosition: guards.isFreshPosition,
  },
  delays: {
    sendInterval: ({ context }) => context.interval,
  },
})

// ----------------------------------------------------------------------------
// actions
// ----------------------------------------------------------------------------
// these should be in their own file but exporting `config` spits out a type error
// due to missing type exports from xstate (see Guard import above) so for now
// everything is in one file.

/**
 * Update internal settings based on the settings passed on the `update_settings`
 * event.
 * @note This changes how the machine behaves and what it sends to the geolocator actor
 *       for what concerns timing, precision and other options.
 */
const updateSettings = config.assign(({ context, event }) => {
  if (event.type !== 'update_settings') return {}
  const settings: Tracking.Settings = { ...context.settings, ...event.settings }
  const interval = settings.interval ?? context.interval
  return { settings, interval }
})

/**
 * change the geolocator options based on the current machine settings.
 * This assign should be called after `updateSettings` and should be used in
 * a transition that makes sure we dispatch the new options to the geolocator actor
 */
const assignLocatorOptions = config.assign(({ context }) => {
  const { settings, options } = context
  return {
    options: updateGeolocatorOptions({ settings, options }),
  }
})

/**
 * tell the geolocator actor to start watching.
 * @todo update geolocator actor to handle multiple watchers with different options
 *       when this is done this should become an `assign` so we can save the id to stop later.
 */
const startWatch = config.createAction(({ context }) => {
  const { geolocatorActor: geo } = context
  geo.send({ type: 'START_WATCHING', options: context.options })
})

/**
 * tell the geolocator actor to stop watching.
 * @todo update geolocator actor to handle multiple watchers
 *       when this is done this should be called when we update the options too,
 *       so we can restart a new watch with the new options.
 */
const stopWatch = config.createAction(({ context }) => {
  const { geolocatorActor: geo } = context
  geo.send({ type: 'STOP_WATCHING' })
})

// ----------------------------------------------------------------------------
// Machine
// ----------------------------------------------------------------------------
// There are two versions of this machine because we are working on making it
// work properly and it is easier to keep the old machine as reference for the
// concept while we design the new one.

const machine = config.createMachine({
  id: 'tracking',
  version: '1.0.1',
  description: `
  A state machine to manage a device tracking session and associated functionalities.

  The machine is in charge of syncing with a geolocator actor events to know the last
  known position, handling server requests through promise actors and its own
  internal state and timers to decide when to send the location to the server.`,
  context: ({ input }) => createContext({ input }),
  // initial: 'starting', // left over
  initial: 'idle',
  on: {
    can_geolocate: {
      actions: assign({ canGeolocate: ({ event }) => event.canGeolocate }),
    },
    update_settings: {
      actions: [updateSettings, assignLocatorOptions],
      description: 'update internal settings and geolocator options for next round',
    },
    set_location: {
      actions: [assign({ lastLocation: ({ event }) => event.location })],
      description: 'always update the last known location when we receive it',
    },
    // hook up internals
    // - error event to go to error state with the error message
  },
  invoke: {
    id: 'setup',
    src: 'setup',
    input: ({ context }) => ({ service: context.geolocatorActor }),
    onDone: [
      // todo: ensure these fire properly or move to `starting` state and do routing there
      {
        target: '.error',
        actions: assign({ error: 'Failed to setup geolocator' }),
        guard: ({ context }) => !context.canGeolocate,
      },
      {
        actions: [emit({ type: 'ready' }), assign({ error: null })],
      },
      {
        target: '.idle',
        guard: ({ context }) => context.canGeolocate && !context.sessionId,
        description: 'setup is done, we can geolocate but do not hve a session yet, so we idle',
      },
      {
        target: '.working',
        guard: ({ context }) => context.canGeolocate && !!context.sessionId,
        description: 'we have an active session id already, so we can start the main loop',
      },
    ],
    onError: {
      target: '.error',
      actions: assign({
        error: ({ event }) => String(event.error) ?? 'unknown error during setup',
      }),
      // todo: use events to go to error instead, so we can specify what happened
    },
  },
  states: {
    // starting: {
    //   // todo: do we need this, with the initial invoke?
    //   description: 'initial state acting as router',
    // },
    error: {
      entry: [emit(({ context }) => ({ type: 'error', error: context.error ?? 'unknown error' }))],
      on: {
        // todo: define what we can do in error states
      },
    },
    idle: {
      on: {
        // todo: handle set_session when we add it so we can process running sessions
        // ----------------------------------------------------------------------
        // when idle start acts as a router depending if we provided a session id
        // or not. if we do not have a session we try and tell te server to
        // create one in the creating_session state; if we already have a session
        // id in the event we can go and use that.
        start: [
          {
            guard: ({ context }) => !context.canGeolocate,
            actions: [emit({ type: 'error', error: 'cannot start tracking without geolocation' })],
          },
          {
            description: 'we have a sessionId to start tracking.',
            guard: ({ event }) => !!event.sessionId,
            actions: assign({ sessionId: ({ event }) => event.sessionId }),
            target: 'working',
          },
        ],
      },
    },
    working: {
      description:
        'main loop where we get location and send it to the server after timeout. when we are here an active session needs to exist and be set.',
      entry: [startWatch, emit({ type: 'started' })],
      exit: [stopWatch, emit({ type: 'stopped' })],
      on: {
        start: [
          {
            target: '.stopping',
            description: 'if we receive a a falsy session id we stop',
            guard: ({ event }) => !event.sessionId,
          },
        ],
        stop: {
          target: '.stopping',
          description: 'notify server of stop current session and go idle when done',
          // guard: ({ context }) => !!context.sessionId,
        },
        // update_settings: {
        //   actions: [updateSettings, assignLocatorOptions],
        //   description: 'update internal settings and geolocator options for next round',
        //   target: 'waiting', // restart the loop with new settings
        // },
      },
      initial: 'locating',

      states: {
        waiting: {
          description: 'wait the defined interval to dispatch the device location',
          entry: [
            log(
              ({ context }) => `🕝 waiting ${context.interval} for next location send`,
              '[tracking.workging.waiting]',
            ),
          ],
          exit: [log('exiting waiting state', '[tracking.working.waiting]')],
          on: {
            update_settings: {
              actions: [updateSettings, assignLocatorOptions],
            },
          },
          after: {
            sendInterval: [
              {
                target: 'locating',
                guard: ({ context }) => !!context.sessionId,
              },
              {
                target: 'stopping',
              },
            ],
          },
          // right now we just want to wait `interval` time and then go to locating
        },
        locating: {
          // todo: check if our cached last location is fresh enough to send. if so
          // we should go to sending directly
          description: 'handle location retrieval and caching',
          invoke: {
            id: 'getLocation',
            src: 'getLocation',
            input: ({ context }) => context.options,
            onDone: [
              {
                target: 'sending',
                actions: assign({ lastLocation: ({ event }) => event.output, error: undefined }),
                guard: ({ event, context }) => !!event.output && !!context.sessionId,
              },
              {
                target: 'stopping',
                guard: ({ context }) => !context.sessionId,
                actions: [
                  log('no sessionId, cannot send location', '[tracking.working.locating]'),
                  emit({ type: 'error', error: 'no sessionId, cannot send location' }),
                ],
              },
            ],
            onError: [
              {
                target: '..error',
                actions: assign({
                  error: ({ event }) => (event.error ? String(event.error) : 'unknown'),
                }),
              },
            ],
          },
        },
        sending: {
          description: 'send the location in context to the server',
          invoke: {
            id: 'send_position',
            src: 'sendPosition',
            input: ({ context }) => ({ sessionId: context.sessionId!, ...context.lastLocation! }),
            onDone: {
              target: 'waiting',
              actions: [
                emit(({ event }) => ({ type: 'sent', payload: event.output })),
                assign({ lastSentMs: Date.now(), error: undefined }),
              ],
            },
            onError: [
              {
                target: '..error',
                actions: assign({
                  error: ({ event }) => (event.error ? String(event.error) : 'unknown'),
                }),
              },
            ],
          },
        },
        stopping: {
          entry: [emit({ type: 'stopping' })],
          description:
            'This state was in charge of closing the session on the server but with the requests api we do it differently, but it is still useful to have a stopping state to cleanup and go idle.',
          target: '#tracking.idle',
        },
      },
    },
  },
})

export { machine }
export default machine
