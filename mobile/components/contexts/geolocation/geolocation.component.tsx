import { useEffect, useRef } from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'

import * as helpers from '@/lib/geolocation'

import { useDeviceContext } from '../device-manager'
import { GeolocationContext, useGeolocationReducer, action } from './geolocation.context'
import { useListenersController } from './listeners.controller'

type GeolocationProviderProps = {
  children: React.ReactNode
}

function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, dispatch] = useGeolocationReducer()
  const { device, heartbeat } = useDeviceContext()
  // last location sent to the server to avoid duplicate calls
  const lastLocationId = useRef<string | null>(null)
  // const initialized = useRef(false)
  const listeners = useListenersController(true)

  // useSetupGeolocation()

  // --------------------------------------------------------------------------
  // reset all event listeners on mount/unmount
  // useEffect(() => {
  //   console.log('⚙️ [BGL::events] Cleaning up GeolocationContext')
  //   BackgroundGeolocation.removeAllListeners()
  //   console.log('✅ [BGL::events] Cleaned up all previous')
  // }, [])

  /**
   * Sets up ALL event listeners for `react-native-background-geolocation`
   * and dispatches actions to the provided dispatcher for the reducer.
   * It is up to us in the reducer and parent component to decide what to do
   * with the dispatched events.
   *
   * @param dispatch The dispatcher from `useReducer` to dispatch actions to.
   * @returns A cleanup function to remove all listeners.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  useEffect(() => {
    console.log('⚙️ [BGL::events] ----------------------------------------------')
    console.log('⚙️ [BGL::events] Initializing GeolocationContext')

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
        send('💓 plugin heartbeat')({ ...event.location })
        // this gets caught in onLocation so we don't need to do anything else here
        // we COULD send the last known location in event.location without querying
        // the device again since we technically are not moving, but...
        const options = helpers.transformGetLocationOptions(device, {})
        await BackgroundGeolocation.getCurrentPosition(options)
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
      BackgroundGeolocation.onMotionChange(send('🏃 motion changed')),
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

  // initialize background geolocation on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  useEffect(() => {
    // if (initialized.current) return console.log('⚙️ [BGL::setup ] already initialized, skipping')
    BackgroundGeolocation.on
    console.log('⚙️ [BGL::setup ] calling BackgroundGeolocation.ready')
    // todo: merge initial device settings + secure store from unmount
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 25,
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      heartbeatInterval: 60,
      debug: false,
    }).then(async (state) => {
      if (!state.enabled) {
        // biome-ignore lint/style/noParameterAssign: reassigning state parameter is intentional here
        state = await BackgroundGeolocation.start()
      }
      dispatch(action.event({ name: '🎉 geolocation ready', data: state }))
      dispatch(action.update(state))
      // initialized.current = true
      console.log('🎉 [BGL::setup ] BackgroundGeolocation initialized')
    })
  }, [])

  // fixme: this is broken and causes multiple config updates even though device.settings
  // hasn't changed - need to isolate just the settings object
  // useEffect(() => {
  //   if (!device?.settings) return
  //   console.log('🛠️ [BGL::setup ] Device settings changed, updating config', device.settings)
  //   BackgroundGeolocation.setConfig(helpers.transformSettings(device.settings)).then(() => {
  //     console.log('🛠️ [BGL::setup ] config updated')
  //   })
  // }, [device?.settings])

  const clearLocations = () => dispatch(action.clear())
  const clearEvents = () => dispatch(action.clearEvents())

  const value = { ...state, dispatch, clearLocations, clearEvents }

  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export default GeolocationProvider
