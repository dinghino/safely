import { assertEvent, assign, emit, log, setup } from 'xstate'
// biome-ignore lint/correctness/noUnusedImports: cannot infer machine type without this
import type { Guard } from 'xstate/guards'
import { Locator } from '../lib/locator.types'

import type { LocationMachine } from './types'
import * as actor from './actors'

function isErrorOfType<T extends Locator.LocatorError>(err: unknown, type: T['type']): err is T {
  return err instanceof Locator.LocatorError && err.type === type
}

// ----------------------------------------------------------------------------
// Machine setup
// ----------------------------------------------------------------------------

const config = setup({
  types: {
    input: {} as LocationMachine.Inputs,
    context: {} as LocationMachine.Context,
    events: {} as LocationMachine.Event,
    emitted: {} as LocationMachine.Emitted,
  },
  guards: {
    canGeolocate: ({ context }) => context.service.canGeolocate(),
    isPermissionGranted: ({ context }) => context.permissionStatus === 'granted',
    hasValidLocation: ({ context }) => context.data !== null && context.timestamp > 0,
  },
  actors: {
    requestPermissions: actor.requestPermissions,
    requestLocation: actor.requestLocation,
    watchLocation: actor.watchLocation,
  },
})

// ----------------------------------------------------------------------------
// Machine definition
// ----------------------------------------------------------------------------

export const machine = config.createMachine({
  id: 'location',
  initial: 'bootstrap',
  context: ({ input }) => ({
    data: null,
    error: null,
    watchId: null,
    timestamp: 0,
    maxAge: input.maxAge || 1000 * 60 * 15, // default max age 15 min
    service: input.service,
    retryCount: 0,
  }),
  states: {
    bootstrap: {
      initial: 'checkingCapabilities',
      description: 'Location service just started, checking capabilities',
      states: {
        checkingCapabilities: {
          description: 'Checking if geolocation is available',
          entry: [({ context }) => context.service.canGeolocate()],
          always: [
            { target: 'requestingPermission', guard: 'canGeolocate' },
            // unavailable if capabilities check fails
            { target: '#location.error.unavailable' },
          ],
        },

        requestingPermission: {
          entry: [log('Requesting geolocation permission')],
          description: 'Requesting permission to access geolocation',
          invoke: {
            id: 'requestPermissions',
            src: 'requestPermissions',
            input: ({ context: { service } }) => ({ service }),
            onDone: {
              target: '#location.ready',
              actions: [
                ({ event }) => log(`Permission result: ${event.output}`),
                assign({ permissionStatus: ({ event }) => event.output }),
              ],
            },
            onError: [
              {
                target: '#location.error.denied',
                guard: ({ event }) => isErrorOfType(event.error, 'denied'),
              },
              {
                target: '#location.error.timeout',
                guard: ({ event }) => isErrorOfType(event.error, 'timeout'),
              },
              {
                target: '#location.error',
                actions: [
                  assign({ error: ({ event }) => `Permission request failed: ${event.error}` }),
                ],
              },
            ],
          },
        },
      },
    },
    ready: {
      description: 'Location service is ready to provide data',
      entry: [emit({ type: 'READY' })],
      on: {
        START_WATCHING: { target: 'watching' },
        REQUEST_PERMISSION: 'bootstrap.requestingPermission',
        GET_POSITION: 'requestingLocation',
      },
    },
    error: {
      initial: 'unknown',
      description: 'Locator error. This should loosely map to Locator.Status error values',
      // todo: differentiate error types and handle accordingly
      entry: [
        emit(({ context }) => ({
          type: 'ERROR',
          error: context.error?.toString() ?? 'Geolocation error',
        })),
      ],
      exit: assign({ error: null }),
      on: {
        RESTART: 'bootstrap',
        START_WATCHING: '#location.bootstrap',
        GET_POSITION: '#location.requestingLocation',
        REQUEST_PERMISSION: '#location.bootstrap',
      },
      states: {
        unknown: {
          description: 'Unknown error state',
          // on: { REQUEST_PERMISSION: '#location.bootstrap' },
        },
        unavailable: {
          type: 'final',
          description: 'Geolocation API not available on this device',
          // final state. we can't do anything. override ?
          on: {
            RESTART: [],
            START_WATCHING: [],
            GET_POSITION: [],
            REQUEST_PERMISSION: [],
          },
        },
        timeout: {
          description: 'Geolocation request timed out',
          // on: {
          //   // START_WATCHING: '#location.bootstrap',
          //   // GET_POSITION: '#location.requestingLocation',
          //   // REQUEST_PERMISSION: '#location.bootstrap',
          //   // RESTART: '#location.bootstrap',
          // },
        },
        denied: {
          description: 'User denied permission to access geolocation. can retry',
          // on: {
          //   // START_WATCHING: '#location.bootstrap',
          //   // GET_POSITION: '#location.requestingLocation',
          //   // REQUEST_PERMISSION: '#location.bootstrap',
          //   // RESTART: '#location.bootstrap',
          // },
        },
      },
    },
    watching: {
      description: 'Actively watching position changes, store and emit updates',
      // create a watch on the geolocation provider and store the watchId
      entry: [emit({ type: 'WATCHING' })],
      exit: [], // clear the watch using the watchId
      invoke: {
        id: 'watchLocation',
        src: 'watchLocation',
        input: ({ context: { service, watchId } }) => ({ service, watchId }),
      },
      on: {
        WATCH_UPDATE: {
          actions: [
            log('Location update received'),
            assign({ data: ({ event }) => event.data, timestamp: () => Date.now() }),
            emit(({ event }) => ({ type: 'LOCATION_UPDATE', data: event.data })),
          ],
        },
        WATCH_STARTED: {
          actions: [assign({ watchId: ({ event }) => event.watchId })],
        },
        STOP_WATCHING: {
          target: 'ready',
          actions: [assign({ watchId: null })], // cancel current watch ?
        },
        GET_POSITION: {
          actions: [], // emit current position if available
        },
      },
    },
    requestingLocation: {
      description: 'One off request for current location',
      initial: 'working',
      states: {
        working: {
          invoke: {
            id: 'requestLocation',
            src: 'requestLocation',
            input: ({ context, event }) => {
              assertEvent(event, 'GET_POSITION')
              // get position can override the default maxAge of the machine
              const maxAge = event.options?.maximumAge ?? context.maxAge
              return { ...context, maxAge, options: event.options }
            },
            onDone: {
              target: '#location.ready',
              actions: [
                log('Location obtained'),
                assign({
                  data: ({ event }) => event.output,
                  timestamp: () => Date.now(),
                  retryCount: 0,
                }),
                emit(({ event }) => ({ type: 'LOCATION_UPDATE', data: event.output })),
              ],
            },
            onError: [
              {
                // target: '#location.error.timeout',
                target: 'error.timeout',
                guard: ({ event }) => isErrorOfType(event.error, 'timeout'),
              },
            ],
          },
        },
        error: {
          initial: 'default',
          states: {
            default: {
              description: 'Unknown error requesting location',
              target: '..error',
            },
            timeout: {
              always: [
                {
                  target: '#location.error.timeout',
                  guard: ({ context }) => context.retryCount >= 4,
                },
              ],
              after: {
                5000: {
                  target: '..working',
                  actions: [assign({ retryCount: ({ context }) => context.retryCount + 1 })],
                },
              },
              on: {
                RESTART: '..working',
              },
            },
          },
        },
      },
    },
  },
})
