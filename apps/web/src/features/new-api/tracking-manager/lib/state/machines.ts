import { setup, assertEvent, fromPromise, raise } from 'xstate'
import type { ActorRefFrom } from 'xstate'

import { getPosition } from '../utils'

import type { Context, Events, Inputs, SendPositionPayload } from './types'

/**
 * Placeholder locator actor to be replaced with state machine later on
 */
// type ParentActor = ActorRef<Snapshot<unknown>, Extract<Events, { type: 'SEND_POSITION' }>>
const getPositionActor = fromPromise(
  // async ({ input }: { input: PositionOptions & { parent: ParentActor } }) => {
  async ({ input }: { input: PositionOptions }) => {
    console.log('[xstate] getPosition actor called with', input)
    const result = await getPosition(input)
    const timestamp = Date.now()
    return { ...result, timestamp } satisfies SendPositionPayload
  },
)

/// main machine --------------------------------------------------------------

const config = setup({
  types: {
    input: {} as Inputs,
    context: {} as Context,
    events: {} as Events,
  },
  actors: {
    getLocation: getPositionActor,
  },
  delays: {
    interval: ({ context }) => context.settings.interval ?? 10 * 60 * 1_000, // DO NOT DELETE JESUS CHRIST
  },
  guards: {
    hasSession: ({ context }) => !!context.sessionId,
  },
})

// ----------------------------------------------------------------------------
// Actions

/**
 * starts a new tracking session on the backend. we'll get the session ID back
 * via the SET_SESSION event.
 */
// const startSession = init.createAction(async ({ context }) => {
//   await context.startSession()
// })
/** internal setter of the active session id */
const setActiveSession = config.assign({
  sessionId: ({ event }) => {
    assertEvent(event, 'SET_SESSION')
    const { sessionId } = event.payload
    return sessionId
  },
})

/** closes the active session on the backend */
const closeActiveSession = config.createAction(async ({ context }) => {
  const { sessionId } = context
  if (!sessionId) return
  await context.closeSession({ sessionId })
})
/** clear internal context sessionId */
const clearActiveSession = config.assign({ sessionId: null })

/** updates the internal settings from the device settings */
const updateSettings = config.assign({
  settings: ({ context, event }) => {
    assertEvent(event, 'UPDATE_SETTINGS')
    const { interval = 5 * 1_000 } = event.payload
    // fixme: return interval to dynamic after testing
    return { ...context.settings, interval }
  },
})

/**
 * sends the current position to the backend
 * @todo split getPosition into its own actor so we can reuse it
 */
const sendPosition = config.createAction(async ({ context, event, self }) => {
  const { sessionId } = context
  if (!sessionId) return self.send({ type: 'FAILED_TO_SEND', error: 'No active session' })
  assertEvent(event, 'SEND_POSITION')
  // const result = await getPosition({ enableHighAccuracy: true })
  const result = event.payload
  const data = { ...result, timestamp: Date.now() }

  const { timestamp, ...payload } = data
  if (context.lastSent === timestamp) {
    console.warn('Skipping duplicate position update with same timestamp', data)
    return self.send({ type: 'POSITION_SENT', payload: { timestamp } })
  }
  console.log('🟢 sending position update to backend', { sessionId, ...payload })
  await context.sendPosition({ sessionId, ...payload })
  return self.send({ type: 'POSITION_SENT', payload: { timestamp } })
})

const assignLastSent = config.assign({
  lastSent: ({ event }) => {
    assertEvent(event, ['SEND_POSITION', 'POSITION_SENT'])
    return event.payload.timestamp
  },
})

// ----------------------------------------------------------------------------
// States

const inactive = config.createStateConfig({
  entry: [clearActiveSession],
  on: {
    START_SESSION: {
      target: 'active',
      // actions: [clearActiveSession, startSession],
      // onDone: 'active',
    },
    SET_SESSION: {
      actions: [setActiveSession],
      target: 'active',
    },
  },
})

const active = config.createStateConfig({
  initial: 'locating',
  // we call the sendPosition every time we enter the tracking state since we
  // are now tracking an active session. this acts as a first immediate update
  // before we go into the idle state and wait for the timeout.
  // entry: [sendPosition],
  exit: [clearActiveSession, closeActiveSession],
  on: {
    SEND_POSITION: { target: '.sending' },
    UPDATE_SETTINGS: { target: '.idle' },
    STOP_SESSION: { target: 'inactive' },
  },
  // onDone: { target: 'inactive' },
  states: {
    // idle state, waiting for position to send
    error: { target: 'inactive' },
    completed: { entry: [raise({ type: 'STOP_SESSION' })] },
    // dynamic interval based on device settings
    idle: { after: { interval: { target: 'locating' } } },

    locating: {
      invoke: {
        id: 'getLocation',
        src: 'getLocation',
        input: ({ context: { settings } }) => ({
          enableHighAccuracy: true,
          maximumAge: settings.interval,
        }),
        onDone: {
          actions: raise(({ event }) => ({ type: 'SEND_POSITION', payload: event.output })),
        },
        onError: 'error',
      },
    },

    // state for actually sending the position
    sending: {
      entry: [sendPosition],
      on: {
        POSITION_SENT: { target: 'idle', actions: [assignLastSent] },
        FAILED_TO_SEND: { target: 'error' },
      },
    },
  },
})

/**
 * This state machine manages the active session and sending location points
 * for the device it is running on.
 */
export const activeSessionManager = config.createMachine({
  id: 'activeSessionTracking',
  initial: 'inactive',
  context: ({ input }) => {
    const { updateTimeout, sessionId, ...rest } = input
    return {
      ...rest,
      sessionId,
      settings: { interval: updateTimeout ?? 10 * 60 * 1_000 },
    }
  },
  on: {
    UPDATE_SETTINGS: { actions: [updateSettings] },
    // STOP_SESSION: { target: '.inactive', actions: [closeActiveSession] },
  },
  states: {
    inactive,
    active,
  },
})

export type ActiveSessionManager = ActorRefFrom<typeof activeSessionManager>

export default activeSessionManager
