import { useCallback, useEffect, useRef } from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'

import * as helpers from '@/lib/geolocation'

import { useDeviceContext } from '../device-manager'
import {
  GeolocationContext,
  useGeolocationReducer,
  action,
  type Geolocation,
} from './geolocation.context'
import { useListenersController } from './listeners.controller'

type GeolocationProviderProps = {
  children: React.ReactNode
}

function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, dispatch] = useGeolocationReducer()
  const { settings, heartbeat } = useDeviceContext()
  // last location sent to the server to avoid duplicate calls
  const lastLocationId = useRef<string | null>(null)
  // const initialized = useRef(false)
  const listeners = useListenersController(false)

  // --------------------------------------------------------------------------
  // reset all event listeners on mount/unmount
  // useEffect(() => {
  //   const cleanupBGL = () => {
  //     console.log('⚙️ [BGL::events] Cleaning up GeolocationContext')
  //     BackgroundGeolocation.removeAllListeners()
  //     console.log('✅ [BGL::events] Cleaned up all previous')
  //   }
  //   cleanupBGL()
  //   return cleanupBGL
  // }, [])

  // --------------------------------------------------------------------------
  // event listeners split by dependencies

  /**
   * Sets up ALL event listeners for `react-native-background-geolocation`
   * and dispatches actions to the provided dispatcher for the reducer.
   * It is up to us in the reducer and parent component to decide what to do
   * with the dispatched events.
   *
   * @param dispatch The dispatcher from `useReducer` to dispatch actions to.
   * @returns A cleanup function to remove all listeners.
   */
  // useEffect(() => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  const setupListeners = useCallback(() => {
    console.log('⚙️ [BGL::events] ----------------------------------------------')
    console.log('⚙️ [BGL::events] Initializing GeolocationContext')
    if (listeners.current.length > 0) {
      cleanupListeners()
    }
    /**
     * Wrapper to dispatch(action.event) that takes in a name and returns a
     * function that takes any data and sends the event to the reducer.
     */
    const send = (name: string) => {
      return <T,>(data: T) => dispatch(action.event({ name, data }))
    }

    console.log('♻️ [BGL::events] Setting up event listeners')

    send('♻️ setting up event listeners')({})

    listeners.register(
      'location',
      BackgroundGeolocation.onLocation(
        async (location) => {
          if (location.sample) return

          console.log('📍 [BGL::onLocation]')

          if (lastLocationId.current === location.uuid) {
            console.log('💤 [BGL::onLocation] Duplicate location, skipping heartbeat')
            send('💤 duplicate location')(location)
            return
          }
          lastLocationId.current = location.uuid

          dispatch(action.location(location))
          send('💖 server heartbeat...')(location)
          await heartbeat(location)
          send('💖 server heartbeat sent')(location)
        },
        (error) => console.warn('[onLocation] ERROR:', error),
      ),
    )
    listeners.register(
      'heartbeat',
      BackgroundGeolocation.onHeartbeat(async (event) => {
        console.log('💓 [BGL::onHeartbeat] - Heartbeat event')
        /**
         * Handle async tasks in background.
         * @see {@link https://github.com/transistorsoft/react-native-background-geolocation/blob/9ce1d4496ecf8ad37b1d4062322f152af1879407/CHANGELOG.md#L184-L195}
         */
        const taskid = await BackgroundGeolocation.startBackgroundTask()
        try {
          const { location } = event
          send('💓 plugin heartbeat')({ ...location })
          // if (lastLocationId.current === location.uuid) {
          //   console.log('💤 [BGL::onLocation] Duplicate location, skipping heartbeat')
          //   send('💤 duplicate location')(location)
          //   return
          // }
          // lastLocationId.current = location.uuid
          // send('💖 server heartbeat...')(location)
          // await heartbeat(location)
          // send('💖 server heartbeat sent')(location)
          // this gets caught in onLocation so we don't need to do anything else here
          // we COULD send the last known location in event.location without querying
          // the device again since we technically are not moving, but...
          const options = helpers.transformGetLocationOptions(settings, {})
          await BackgroundGeolocation.getCurrentPosition(options)
        } catch (error) {
          console.warn('[onHeartbeat] ERROR:', error)
        } finally {
          BackgroundGeolocation.stopBackgroundTask(taskid)
        }
      }),
    )
    listeners.register(
      'enabled_change',
      BackgroundGeolocation.onEnabledChange((enabled) => {
        send('🔌 enabled changed')(enabled)
        dispatch(action.update({ enabled }))
      }),
    )

    listeners.register(
      'motion_change',
      BackgroundGeolocation.onMotionChange((state) => {
        send('🏃 motion changed')({ isMoving: state.isMoving })
        dispatch(action.update({ isMoving: state.isMoving }))
      }),
    )

    listeners.register(
      'activity_change',
      BackgroundGeolocation.onActivityChange(send('🎭 activity changed')),
    )
    listeners.register('http', BackgroundGeolocation.onHttp(send('🌐 http')))

    // geofences
    listeners.register('geofence', BackgroundGeolocation.onGeofence(send('🧸 geofence')))
    listeners.register(
      'geofences_change',
      BackgroundGeolocation.onGeofencesChange(send('🧸 geofences changed')),
    )
    listeners.register('schedule', BackgroundGeolocation.onSchedule(send('⏰ schedule event')))

    // os related
    listeners.register(
      'provider_change',
      BackgroundGeolocation.onProviderChange(send('📱 provider changed')),
    )
    listeners.register(
      'connectivity_change',
      BackgroundGeolocation.onConnectivityChange(send('🛜 connectivity change')),
    )
    listeners.register(
      'power_save_change',
      BackgroundGeolocation.onPowerSaveChange(send('🔋 power save change')),
    )
    listeners.register(
      'authorization',
      BackgroundGeolocation.onAuthorization(send('🔑 authorization')),
    )
    listeners.register(
      'notification_action',
      BackgroundGeolocation.onNotificationAction(send('🔔 notification action')),
    )

    send('✅ event listeners set up')(listeners.current.names)

    console.log(`✅ [BGL::events] Event listeners set up: ${listeners.current.length}`)

    const cleanup = () => {
      console.log('⚙️ [BGL::events] Cleaning up Geolocation subscriptions')
      listeners.unregisterAll()

      send('♻️ cleaned up event listeners')(listeners.current.names)
    }

    return cleanup
  }, [heartbeat])

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable entities
  const cleanupListeners = useCallback(() => {
    if (listeners.current.length === 0) return
    console.log('⚙️ [BGL::events] Cleaning up GeolocationContext')
    BackgroundGeolocation.removeAllListeners()
    const data = listeners.current.names
    console.log('⚙️ [BGL::events] Cleaning up Geolocation subscriptions')
    listeners.unregisterAll()
    dispatch(action.event({ name: '♻️ cleaned up event listeners', data }))
  }, [])

  useEffect(() => {
    setupListeners()
    return () => cleanupListeners()
  }, [setupListeners, cleanupListeners])

  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  useEffect(() => {
    // if (initialized.current) return console.log('⚙️ [BGL::setup ] already initialized, skipping')
    setup()
      // .then(async () => await BackgroundGeolocation.start())
      .then((state) => {
        dispatch(action.update(state))
        dispatch(action.event({ name: '🎉 geolocation ready', data: state }))
        // initialized.current = true
        console.log('🎉 [BGL::setup ] BackgroundGeolocation initialized')
      })
    resolver?.()

    console.log('⚙️ [BGL::setup ] calling BackgroundGeolocation.ready')
  }, [])

  // --------------------------------------------------------------------------
  // update BGL config when device settings change from server
  useEffect(() => {
    if (!settings) return
    console.log('🛠️ [BGL::setup ] Device settings changed, updating config')
    const config = helpers.transformSettings(settings)
    BackgroundGeolocation.setConfig(config).then(() => {
      console.log('🛠️ [BGL::setup ] config updated')
      dispatch(action.update(config))
      dispatch(action.event({ name: '🛠️ config updated', data: { settings, config } }))
    })
  }, [settings, dispatch])

  const clearLocations = () => dispatch(action.clear())
  const clearEvents = () => dispatch(action.clearEvents())

  const value = {
    ...state,
    dispatch,
    clearLocations,
    clearEvents,
    listeners: {
      setup: setupListeners,
      cleanup: cleanupListeners,
    },
  } satisfies Geolocation.Context

  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export default GeolocationProvider

let resolver: (() => void) | null = null
const initPromise: Promise<void> = new Promise((resolve) => {
  resolver = resolve
})

async function setup() {
  if (!resolver) {
    console.log('❓ [BGL::setup ] setup already in progress or completed')
    return await BackgroundGeolocation.getState()
  }
  await initPromise
  console.log('❓ [BGL::setup ] setup called after component mount')
  // todo: merge initial device settings + secure store from unmount
  return BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 10,
    stopOnTerminate: false,
    enableHeadless: true,
    startOnBoot: true,
    stopTimeout: 1,
    motionTriggerDelay: 10_000,
    logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
    heartbeatInterval: 60,
    isMoving: false,
    debug: false,
    notification: {
      title: 'Your App',
      text: 'Tracking location',
    },
  }).then((state) => {
    resolver = null
    console.log('🛠️ [BGL::ready ] boot configuration')
    console.log(state)
    return state
  })
}
