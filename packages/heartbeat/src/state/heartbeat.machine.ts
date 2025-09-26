import { assign, emit, setup } from 'xstate'
// biome-ignore lint/correctness/noUnusedImports: cannot infer machine type without this
import type { Guard } from 'xstate/guards'

// import type { Locator } from '@workspace/geolocation/types'

import { linkGeolocator } from './actors'
import type { Heartbeat, Geolocator } from './types'
import { DEFAULT_INTERVAL, REQUIRED_ACTORS } from './constants'

const config = setup({
  types: {
    input: {} as Heartbeat.Input,
    context: {} as Heartbeat.Context,
    events: {} as Heartbeat.Events,
    emitted: {} as Heartbeat.Emitted,
  },
  actors: {
    // note: dispatcher and disconnect NEED to be set up when creating the machine
    setup: linkGeolocator,
  } as Heartbeat.Actors,
  delays: {
    // idle interval is split between the idle state and working.getPosition states
    // todo: improve splitting
    // todo: use two separate intervals
    // evaluate them on the fly if we can geolocate
    interval: ({ context }) => context.interval / 2,
  },
})

/**
 * Conditionally request position from geolocator actor if:
 * - we can geolocate
 * - we have a geolocator actor
 * - we don't have a position or it's stale
 */
const requestPositionToGeolocator = config.createAction(({ context }) => {
  // if (!context.canGeolocate) return
  // if (!context.geolocatorActor) return // throw? we need to have it one way or another
  // if (!isStalePosition(context)) return
  // request new position
  const { interval } = context
  context.geolocatorActor.send({
    type: 'GET_POSITION',
    options: { enableHighAccuracy: false, maximumAge: interval, timeout: interval / 2 },
  })
})

const isStalePosition = (context: Heartbeat.Context) => {
  const { position, interval } = context

  if (!position) return true
  const { timestamp } = position
  if (timestamp <= 0) return true
  const age = Date.now() - timestamp
  // give it some slack so we can dispatch the location retrieved on the previous
  // round if it took too long to get it for that heartbeat.
  const maxAge = interval * 2

  return age >= maxAge
}

/**
 * Custom action that validates required actor overrides from `machine.provide({})`
 * that throws at runtime if something is missing.
 * This is to avoid silent failures if we forget to provide them.
 * @todo extract, make dynamic and reusable through a factory function
 */
const validateActors = config.createAction(({ self }) => {
  // console.log('🤖 validating heartbeat configuration')
  const machineConfig = self.getSnapshot().machine.implementations

  const missingActors = REQUIRED_ACTORS.filter((actorKey) => {
    return !machineConfig.actors?.[actorKey]
  })
  if (missingActors.length) {
    throw new Error(`Missing required actors: ${missingActors.join(', ')}`)
  }
})

const working = config.createStateConfig({
  initial: 'init',
  entry: [emit({ type: 'started' })],
  exit: [],
  on: { stop: { target: '..stopped' } },
  states: {
    init: {
      description: 'Decide if we need the position or not',
      always: [
        {
          target: 'getPosition',
          actions: [],
          guard: ({ context }) => isStalePosition(context),
        },
        {
          target: 'dispatching',
          guard: ({ context }) => !context.canGeolocate,
        },
        {
          target: 'dispatching',
        },
      ],
    },
    getPosition: {
      description: 'Query actor/service for current position and forward to dispatching state',
      entry: [requestPositionToGeolocator],
      on: {
        stop: { target: '#device-heartbeat.stopped' },
        locationUpdate: {
          actions: assign({ position: ({ event }) => event.location }),
          target: 'dispatching',
        },
      },
      always: {
        target: 'dispatching',
        actions: [],
        guard: ({ context }) => !isStalePosition(context),
      },
      // regardless of the position, when it's time we move on we do. we'll send whatever
      after: {
        interval: {
          actions: [],
          target: 'dispatching',
        },
      },
    },
    dispatching: {
      description: 'Send heartbeat and wait for response',
      entry: [],
      invoke: {
        src: 'dispatcher',
        id: 'heartbeat-dispatch',
        input: ({ context }) => {
          const { interval, position } = context
          let location: Omit<Geolocator.Data, 'timestamp'> | undefined
          if (position) {
            const { timestamp, ...loc } = position
            location = loc
          }
          return { interval, location }
        },
        onDone: {
          target: '#device-heartbeat.idle',
          actions: [
            assign({
              retryCount: 0,
              token: ({ event }) => event.output,
              lastHeartbeat: () => Date.now(),
            }),
            emit({ type: 'heartbeat' }),
          ],
        },
        onError: { target: '..error' },
      },
    },
  },
})

/**
 * State machine to manage device heartbeat
 * - handles starting/stopping heartbeats
 * - handles retrying on failure
 * - handles disconnecting when deviceId is cleared
 * - stores session token
 *
 * ## Usage
 *
 * ```tsx
 * // react example
 * const [state, send, actor] = useMachine(machine.provide({
 *   dispatcher: fromPromise(async () => { ... }),
 *   disconnect: fromPromise(async ({ input }) => { ... }),
 *   ... // other actors
 * }), { input: { deviceId, interval } })
 * ```
 *
 * Actors are undefined and **MUST** be provided when creating the machine
 * Success/Error events are emitted from the result of the actor invocation by
 * the state machine, so the actors must return the expected values or throw errors
 * and ignore handling xstate internals.
 *
 * ```tsx
 * // you can hook up to events and changes in your external state to do stuff
 * useEffect(() => send({ type: 'setDeviceId', deviceId }), [deviceId, send])
 * useEffect(() => send({ type: 'setInterval', interval }), [interval, send])
 * ```
 *
 * ### Handling unload event
 * To ensure the device is disconnected properly when the user leaves the page,
 * you should listen for the `beforeunload` event and send the `disconnect` event to the machine.
 * We have a `useWindowEvent` hook you can use for this:
 * ```tsx
 * useWindowEvent('beforeunload', () => send({ type: 'disconnect' }))
 * ```
 *
 * ## Notes
 *
 * - `deviceId` is the associated id for the current device. should be one and done.
 *   it is **not** the device ID from the database, but our own id.
 * - `interval` comes from device settings, but we have a default if not set
 */
const machine = config.createMachine({
  id: 'device-heartbeat',
  initial: 'init',
  context: ({ input }) => ({
    ...input,
    token: null,
    lastHeartbeat: null,
    interval: input.interval ?? DEFAULT_INTERVAL,
    // geo
    position: null,
    canGeolocate: false,
    // retry config
    retryCount: 0,
    maxRetries: 3,
  }),
  entry: [validateActors],
  invoke: {
    src: 'setup',
    id: 'setup-geolocator',
    input: ({ context }) => ({ service: context.geolocatorActor }),
  },
  on: {
    disconnect: { target: '.disconnecting', guard: ({ context }) => !!context.token },
    setInterval: [
      {
        target: '.idle',
        description:
          'update interval and restart idle to update the `after` timer.\ntransition will be ignored if interval is 0 or no deviceId',
        actions: [
          assign({ interval: ({ event }) => event.interval }),
          emit(({ context }) => ({ type: 'intervalChanged', interval: context.interval })),
        ],
        guard: ({ context, event }) =>
          !!context.deviceId && event.interval > 0 && event.interval !== context.interval,
      },
    ],
    setDeviceId: [
      {
        target: '.working',
        description: 'set deviceId and start heartbeats',
        actions: [assign({ deviceId: ({ event }) => event.deviceId })],
        guard: ({ event }) => !!event.deviceId,
      },
      {
        target: '.disconnecting',
        description: 'if we set a falsy deviceId and have a token, disconnect first',
        actions: [assign({ deviceId: undefined, token: null })],
        guard: ({ event, context }) => !event.deviceId && !!context.token,
      },
      {
        target: '.stopped',
        description: 'clear deviceId and stop heartbeats',
        actions: [assign({ deviceId: undefined, token: null })],
        guard: ({ event }) => !event.deviceId,
      },
    ],
    locationUpdate: {
      actions: [assign({ position: ({ event }) => event.location })],
    },
    canGeolocate: { actions: assign({ canGeolocate: true }) },
    clear: {
      actions: [assign({ position: null })],
    },
  },
  states: {
    init: {
      description:
        'initial state, waiting for deviceId to start. can run other init process from actors if needed',
      always: [
        {
          target: 'working',
          guard: ({ context }) => !!context.deviceId,
        },
        {
          target: 'stopped',
        },
      ],
    },
    idle: {
      description: 'either stopped by device config, waiting for next interval',
      on: { stop: [{ target: 'stopped' }] },
      after: {
        interval: { target: 'working', guard: ({ context }) => !!context.deviceId },
      },
    },
    stopped: {
      entry: [emit({ type: 'stopped' })],
      on: { start: { target: 'working' } },
    },
    working,
    disconnecting: {
      invoke: {
        src: 'disconnect',
        id: 'disconnect',
        input: ({ context }) => ({ token: context.token! }),
        onDone: {
          target: 'stopped',
          actions: [assign({ token: null }), emit({ type: 'disconnected' })],
        },
        onError: {
          target: 'error',
          actions: [emit({ type: 'error', message: 'Disconnect failed' })],
        },
      },
    },
    error: {
      entry: [emit({ type: 'error', message: 'Heartbeat failed' })],
      on: {
        stop: { target: 'stopped' },
      },
      after: {
        interval: {
          description: 'retry heartbeat after interval, up to maxRetries',
          target: 'working',
          actions: [
            assign({ retryCount: ({ context }) => context.retryCount + 1 }),
            emit(({ context }) => ({ type: 'retrying', attempt: context.retryCount + 1 })),
          ],
          guard: ({ context }) => context.retryCount < context.maxRetries,
        },
      },
    },
  },
})

export default machine
