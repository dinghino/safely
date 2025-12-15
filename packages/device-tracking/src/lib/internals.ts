import type { Geolocator, Tracking } from '../types'

/**
 * Initial state machine setup function
 *
 * todo: this is almost exactly the same as the heartbeat setup. we might want
 * to extract it to a common package, or just pull everything together in
 * one package. I don't see heartbeat and tracking being used without the
 * geolocator actor, at least until we move out the setup functions and
 * define some base types package that all can use.
 */
export function setupEventListeners({
  sendBack,
  input,
}: {
  sendBack: (event: Extract<Tracking.Events, { type: 'set_location' | 'can_geolocate' }>) => void
  input: { service: Geolocator.Actor }
}) {
  const { service } = input
  const loc = service.on('LOCATION_UPDATE', ({ data }) => {
    sendBack({ type: 'set_location', location: data })
  })
  const ready = service.on('READY', () => {
    sendBack({ type: 'can_geolocate', canGeolocate: true })
  })
  // todo: we need to know if the geolocation actor can provide location or not

  // handle existing states if the geolocator actor already run its flow
  // and is ready and/or has a location already.
  const snapshot = service.getSnapshot()
  // console.log('session manager setup - geo permissions', snapshot)
  // if the service has permissions, send the event immediately
  if (snapshot.context.permissionStatus === 'granted') {
    sendBack({ type: 'can_geolocate', canGeolocate: true })
  }
  // if it already has a location, send it immediately
  if (snapshot.context.data) {
    sendBack({ type: 'set_location', location: snapshot.context.data })
  }
  return () => {
    ready.unsubscribe()
    loc.unsubscribe()
  }
}

export type UpdaterParams = {
  settings: Tracking.Settings
  options: Geolocator.Options
}

/**
 * Internal function that takes the machine (device) `settings` and currently
 * used geolocator options and creates a new options object to be sent to
 * the geolocator actor.
 * @todo this should be a function passed in the input so each device
 *       can customize it if needed.
 */
export function updateGeolocatorOptions(options: UpdaterParams): Required<Geolocator.Options> {
  const { settings, options: current } = options
  switch (settings.trackingMode) {
    case 'passive':
      // this is technically pointless since passive means we do not track
      return {
        ...current,
        enableHighAccuracy: false,
        timeout: 5 * 60 * 1_000,
        maximumAge: 2 * 60 * 1_000,
      }
    case 'active':
      return {
        ...current,
        enableHighAccuracy: true,
        timeout: (settings.interval / 3) * 2,
        maximumAge: settings.interval,
      }
    case 'aggressive':
      return {
        ...current,
        enableHighAccuracy: true,
        timeout: settings.interval / 2,
        maximumAge: settings.interval / 2,
      }
    default:
      // for any other state we're not considering
      return {
        ...current,
        enableHighAccuracy: false,
        timeout: 60 * 60 * 1_000,
        maximumAge: 15 * 60 * 1_000,
      }
  }
}

export const createContext = ({ input }: { input: Tracking.Inputs }): Tracking.Context => ({
  sessionId: null,
  lastLocation: null,
  lastSentMs: undefined,
  canGeolocate: false,
  interval: input.settings.interval ?? 60 * 1_000,
  ...input,
  settings: { ...input.settings },
  options: updateGeolocatorOptions({ settings: input.settings, options: {} }),
  error: null,
})
export namespace guards {
  /**
   * determines if the cached location is older than what we need to send
   * todo: use something else other than context.interval.
   * @note This guard is used to decide if we need to query for newer location
   * or we can send the one we have.
   */
  export function isFreshPosition({ context }: { context: Tracking.Context }): boolean {
    const last = context.lastLocation
    if (!last) return false
    return Date.now() - last.timestamp < context.interval
  }
}
