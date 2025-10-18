import { Alert } from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation'
import type {
  Subscription,
  // HeadlessEvent,
  Location,
  // Config,
} from 'react-native-background-geolocation'

// let registered = false

// const headlessTask = async (event: HeadlessEvent) => {
//   const { name, params } = event
//   console.log('[BackgroundGeolocation HeadlessTask] -', name, params)
// }

// if (!registered) {
//   console.log('Registering HeadlessTask with BackgroundGeolocation')

//   ////
//   // Register your HeadlessTask with BackgroundGeolocation plugin.
//   //
//   BackgroundGeolocation.registerHeadlessTask(headlessTask)
//   registered = true
// }
// // foreground event listeners

type Handlers = { onLocation?: (location: Location) => void }
export type ListenersMap = Map<string, Subscription>

export const cleanupListeners = (map: ListenersMap | null) => {
  if (!map) return
  console.log('Removing BackgroundGeolocation listeners')
  map.forEach((sub) => {
    sub.remove()
  })
  map.clear()
}

export const setupEventListeners = (opts: Handlers) => {
  console.log('Adding BackgroundGeolocation listeners')

  const listeners: ListenersMap = new Map<string, Subscription>()

  listeners.set(
    'location',
    BackgroundGeolocation.onLocation(
      (location) => {
        Alert.alert('Location Update', JSON.stringify(location))
        console.info('🗺️ [onLocation]', location)
        opts.onLocation?.(location)
      },
      (error) => console.log('🗺️ 🔴 [onLocation] ERROR', error),
    ),
  )
  listeners.set(
    'motionChange',
    BackgroundGeolocation.onMotionChange((event) => {
      console.info('🗺️ [onMotionChange]', event.isMoving, event.location)
      opts.onLocation?.(event.location)
    }),
  )
  listeners.set(
    'activityChange',
    BackgroundGeolocation.onActivityChange((event) => {
      console.info('🗺️ [onActivityChange]', event)
    }),
  )
  listeners.set(
    'providerChange',
    BackgroundGeolocation.onProviderChange((event) => {
      console.info('🗺️ [onProviderChange]', event.enabled, event.status)
    }),
  )
  listeners.set(
    'heartbeat',
    BackgroundGeolocation.onHeartbeat((event) => {
      console.log('[🗺️ onHeartbeat] ', event)
    }),
  )
  listeners.set(
    'onHttp',
    BackgroundGeolocation.onHttp((response) => {
      // let status = response.status
      // let success = response.success
      // let responseText = response.responseText
      console.log('[onHttp] ', response)
    }),
  )
  console.log('Listeners added:', Array.from(listeners.keys()).join(', '))
  return listeners
}

/**
 * Initialize the BackgroundGeolocation library calling the ready method with
 * the desired initial configuration.
 * @param initPromise promise set up on a component mount to delay the setup
 * of the library until the component is mounted.
 * @returns The state returned by the ready call.
 *
 * @usage
 * ```tsx
 * let resolver: (() => void) | null = null
 * const promise = new Promise<void>((res) => {
 *  resolver = res
 * })
 *
 * function MyComponent() {
 * useEffect(() => {
 *   initGeolocation(promise).then(state => {
 *     // library is ready, do what you need with it
 *   })
 *   // signal that the component is mounted and the library can be set up
 *   if (resolver) {
 *     resolver()
 *     resolver = null
 *   }
 * }, [])
 *
 */
export async function initialize(initPromise: Promise<void>) {
  await initPromise
  console.log('Initializing BackgroundGeolocation')
  const state = await BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 50,
    debug: true,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    heartbeatInterval: 60,
    // background ops
    startOnBoot: true,
    // enableHeadless: true,
    preventSuspend: true,
    stopOnTerminate: false,
    // ------------------------------------------------------------------------
    // iOS
    // showsBackgroundLocationIndicator: true,
    // ------------------------------------------------------------------------
    // notifications and permissions
    backgroundPermissionRationale: {
      title: 'Allow access to your location',
      message: 'The app requires your location to work as intended. Provide access',
      positiveAction: 'Consent',
      negativeAction: 'Cancel',
    },
    notification: {
      title: 'Safely.PET',
      priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_HIGH,
      text: 'Location service is running',
      channelName: 'Location',
      sticky: true,
    },
  })
  const { enabled, enableHeadless, debug } = state
  console.log('BackgroundGHeolocation is ready', { enabled, enableHeadless, debug })
  // const state = await BackgroundGeolocation.start()
  return state
}

type HttpOptions = {
  deviceId: string
  sessionToken?: string
}

export function setupHttp(opts: HttpOptions) {
  BackgroundGeolocation.setConfig({
    url: 'https://cool-eagle-370.convex.site/geo',
    method: 'POST',
    autoSync: true,
    autoSyncThreshold: 1,
    httpTimeout: 60_000,
    httpRootProperty: 'data',
    headers: {
      'Content-Type': 'application/json',
    },
    extras: {
      deviceId: opts.deviceId,
      // add optional session token for auth
      // add optional tracking session id to link location updates to a session
    },
    params: {
      authToken: opts.sessionToken,
      deviceId: opts.deviceId,
    },
  })
}

export function disableHttp() {
  BackgroundGeolocation.setConfig({
    url: undefined,
    method: undefined,
    params: {},
    autoSync: false,

  })
}
