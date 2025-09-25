import { assign, emit, setup, type PromiseActorLogic } from 'xstate'

namespace Heartbeat {
  export type Input = {
    deviceId: string // todo: Id<'devices'> ?
    interval?: number // in ms
    // sendHeartbeat?: (data: SenderParams) => Promise<void>
  }
  export type Context = Input & {
    interval: number
    lastHeartbeat: number | null
    token: string | null
    retryCount: number
    maxRetries: number
  }
  export type Events =
    | { type: 'start' }
    | { type: 'stop' }
    | { type: 'setDeviceId'; deviceId: string }
    | { type: 'setInterval'; interval: number }
    | { type: 'disconnect' }

  export type Emitted =
    | { type: 'started' }
    | { type: 'stopped' }
    | { type: 'heartbeat' }
    | { type: 'disconnected' }
    | { type: 'retrying'; attempt: number }
    | { type: 'intervalChanged'; interval: number }
    | { type: 'error'; message: string }

  export namespace Dispatcher {
    export type Input = {
      interval?: number
      location?: unknown
    }
  }
}

type _Emitted<T extends Heartbeat.Emitted['type']> = Extract<Heartbeat.Emitted, { type: T }>

const config = setup({
  types: {
    input: {} as Heartbeat.Input,
    context: {} as Heartbeat.Context,
    events: {} as Heartbeat.Events,
    emitted: {} as Heartbeat.Emitted,
  },
  actors: {} as {
    //** sends the heartbeat and returns the session token */
    dispatcher: PromiseActorLogic<string, Heartbeat.Dispatcher.Input>
    /**
     * disconnects the device from the heartbeat
     * @note this should be called on `beforeunload` when possible to a graceful disconnect
     * and can be called manually by sending the `disconnect` event
     */
    disconnect: PromiseActorLogic<void, { token: string }>
  },
  delays: {
    interval: ({ context }) => context.interval,
  },
})

const DEFAULT_INTERVAL = 1000 * 60 * 5 // 5 minutes

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
 *   actors: fromPromise(async () => { ... }),
 *   disconnect: fromPromise(async ({ input }) => { ... }),
 * }), { input: { deviceId, interval } })
 * ```
 *
 * Actors are undefined and must be provided when creating the machine
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
    interval: input.interval ?? DEFAULT_INTERVAL,
    lastHeartbeat: null,
    retryCount: 0,
    maxRetries: 3,
    token: null,
  }),
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
          ({ context }) => console.log('🍌 set interval', context.interval),
        ],
        guard: ({ context, event }) =>
          !!context.deviceId && event.interval > 0 && event.interval !== context.interval,
      },
    ],
    setDeviceId: [
      {
        target: '.idle',
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
  },
  states: {
    init: {
      descrition:
        'initial state, waiting for deviceId to start. can run other init process from actors if needed',
      always: [
        {
          target: 'working',
          guard: ({ context }) => !!context.deviceId,
        },
      ],
    },
    idle: {
      description: 'either stopped by device config, waiting for next interval',
      on: {
        stop: [
          // { target: 'disconnecting', guard: ({ context }) => !!context.token },
          { target: 'stopped' },
        ],
      },
      after: {
        interval: { target: 'working', guard: ({ context }) => !!context.deviceId },
      },
    },
    stopped: {
      entry: [emit({ type: 'stopped' })],
      on: { start: { target: 'working' } },
    },
    working: {
      entry: [emit({ type: 'started' })],
      on: { stop: { target: 'stopped' } },
      invoke: {
        src: 'dispatcher',
        id: 'heartbeat-dispatch',
        input: ({ context }) => ({ interval: context.interval }),
        onDone: {
          target: 'idle',
          actions: [
            assign({
              retryCount: 0,
              token: ({ event }) => event.output,
              lastHeartbeat: () => Date.now(),
            }),
            emit({ type: 'heartbeat' }),
          ],
        },
        onError: { target: 'error' },
      },
    },
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
