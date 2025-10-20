import { useEffect } from 'react'
import type { Subscription } from 'react-native-background-geolocation'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { GeolocationContext, useGeolocationReducer, action } from './geolocation.context'
import { useDeviceContext } from '../device-manager'
import * as helpers from '@/lib/geolocation'

type GeolocationProviderProps = {
  children: React.ReactNode
}

function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, dispatch] = useGeolocationReducer()

  // server heartbeat -- todo: move business logic to device manager context
  // and just get the heartbeat function in here to register it
  const { device, heartbeat } = useDeviceContext()

  const sendEvent = (name: string) => {
    return <T,>(data: T) => {
      console.log('[BGL::event] ⏱️', name)
      dispatch(action.event({ name, data }))
    }
  }

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
    console.log('♻️ [BGL::events] Setting up event listeners')

    listeners.add(
      BackgroundGeolocation.onLocation(
        async (location) => {
          if (location.sample) return
          console.log('📍 [BGL::onLocation]')
          dispatch(action.location(location))
          await heartbeat(location)
        },
        (error) => console.warn('[onLocation] ERROR:', error),
      ),
    )
    listeners.add(
      BackgroundGeolocation.onHeartbeat(async (event) => {
        console.log('💓 [BGL::onHeartbeat] - Heartbeat event')
        sendEvent('heartbeat')({ ping: 'pong', lastLocation: event.location })

        // this gets caught in onLocation so we don't need to do anything else here
        // we COULD send the last known location in event.location without querying
        // the device again since we technically are not moving, but...
        const options = helpers.transformGetLocationOptions(device, {})
        await BackgroundGeolocation.getCurrentPosition(options)

        // const location = await BackgroundGeolocation.getCurrentPosition(options)
        // console.log('💓 [BGL::onHeartbeat] - Current position:', location)
        // // these should already be handled by onLocation listener
        // // dispatch(action.location(location))
        // // addEvent('location', location)
        // await heartbeat(location)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onEnabledChange((enabled) => {
        sendEvent('🔌 enabled changed')(enabled)
        dispatch(action.update({ enabled }))
      }),
    )

    listeners.add(BackgroundGeolocation.onMotionChange(sendEvent('🏃 motion changed')))
    //   BackgroundGeolocation.onMotionChange((event) => {
    //     dispatchEvent('🏃 motion changed')(event)
    //     if (event.location.sample) return
    //     dispatch(action.location(event.location))
    //   }),
    // )
    listeners.add(BackgroundGeolocation.onProviderChange(sendEvent('📱 provider changed')))
    listeners.add(BackgroundGeolocation.onActivityChange(sendEvent('🎭 activity changed')))
    listeners.add(BackgroundGeolocation.onGeofence(sendEvent('🧸 geofence')))
    listeners.add(BackgroundGeolocation.onHttp(sendEvent('🌐 http')))

    console.log(`✅ [BGL::events] Event listeners set up: ${listeners.count}`)

    const cleanup = () => {
      console.log('⚙️ [BGL::events] Cleaning up Geolocation subscriptions')
      listeners.clear()
    }

    return cleanup
  }, [heartbeat, device])

  // initialize background geolocation on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  useEffect(() => {
    console.log('⚙️ [BGL::setup] calling BackgroundGeolocation.ready')

    // if (initialized) return cleanup
    // todo: merge initial device settings
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 25,
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      heartbeatInterval: 60,
      debug: true,
    }).then(async (state) => {
      if (!state.enabled) {
        // biome-ignore lint/style/noParameterAssign: reassigning state parameter is intentional here
        state = await BackgroundGeolocation.start()
      }
      dispatch(action.update(state))
      sendEvent('🎉 geolocation ready')(state)
    })
    console.log('🎉 [BGL::setup] BackgroundGeolocation initialized')
    // return cleanup
  }, [])

  useEffect(() => {
    if (!device?.settings) return
    console.log('🛠️ [BGL::setup] Device settings changed, updating config', device.settings)
    BackgroundGeolocation.setConfig(helpers.transformSettings(device.settings)).then(() => {
      console.log('🛠️ [BGL::setup] config updated')
    })
  }, [device?.settings])

  const clearLocations = () => dispatch(action.clear())
  const clearEvents = () => dispatch(action.clearEvents())

  const value = { ...state, dispatch, clearLocations, clearEvents }

  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export default GeolocationProvider

class Listeners {
  private listeners: Array<Subscription> = []

  add(sub: Subscription) {
    this.listeners.push(sub)
  }
  clear() {
    this.listeners.forEach((sub) => {
      sub.remove()
    })
    this.listeners = []
  }
  get count() {
    return this.listeners.length
  }
}

const listeners = new Listeners()
