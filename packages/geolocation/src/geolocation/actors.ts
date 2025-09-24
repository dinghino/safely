import { fromPromise, fromCallback } from 'xstate'
import { Locator } from '../lib/locator.types'
import type { LocationMachine } from './types'

type WithService = { service: Locator.Provider }

export const requestPermissions = fromPromise(async ({ input }: { input: WithService }) => {
  const status = await input.service.requestPermission()
  if (status === 'granted') return status
  throw new Locator.LocatorError(status, 'Permission not granted')
})

type RequestLocationInput = Pick<
  LocationMachine.Context,
  'service' | 'data' | 'timestamp' | 'maxAge'
> & {
  options?: Locator.Options
  maxAge: number
}
// fixme: refactor with a fromCallback to use sendBack and emit directly here
// see https://stately.ai/docs/actors#fromcallback
export const requestLocation = fromPromise(async ({ input }: { input: RequestLocationInput }) => {
  const { options, ...ctx } = input
  const now = Date.now()
  const maximumAge = options?.maximumAge ?? ctx.maxAge
  const isFresh = ctx.timestamp && now - ctx.timestamp < maximumAge
  if (ctx.data && isFresh) {
    console.debug('[xstate] returning cached location', ctx.data)
    return { ...ctx.data } satisfies Locator.Data
  }
  const result = ctx.service.getCurrentPosition({ ...options, maximumAge })
  return result
})

type WatchEvents = Extract<
  LocationMachine.Event,
  { type: 'WATCH_UPDATE' | 'WATCH_ERROR' | 'WATCH_STARTED' | 'STOP_WATCHING' }
>
type WatchInput = { service: Locator.Provider; watchId: number | null }
type WatchEmits = Extract<LocationMachine.Emitted, { type: 'LOCATION_UPDATE' }>

export const watchLocation = fromCallback<WatchEvents, WatchInput, WatchEmits>(
  ({ input, emit, sendBack, receive }) => {
    const { service, ...ctx } = input
    if (ctx.watchId) {
      service.clearWatch(ctx.watchId)
    }

    const onUpdate = (data: Locator.Data) => {
      sendBack({ type: 'WATCH_UPDATE', data })
      emit({ type: 'LOCATION_UPDATE', data })
    }
    const onError = (error: Locator.LocatorError) => {
      sendBack({ type: 'WATCH_ERROR', error: error.type })
    }

    // setup listener on the geolocation service

    // todo: refactor API to send back tuple [watchId, stopFn]
    const { watchId, stop: clearWatch } = service.watchPosition({ onUpdate, onError })

    sendBack({ type: 'WATCH_STARTED', watchId })

    // clear the watcher on STOP_WATCHING event from the parent
    receive((event) => {
      if (event.type === 'STOP_WATCHING') {
        clearWatch()
      }
    })
    return () => {
      console.log('[xstate] stopping location watch actor')
      clearWatch()
    }
  },
)
