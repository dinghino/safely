import { useEffect } from 'react'
import type { Subscription } from 'react-native-background-geolocation'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { GeolocationContext, useGeolocationReducer, action } from './geolocation.context'

type GeolocationProviderProps = {
  children: React.ReactNode
}

function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, dispatch] = useGeolocationReducer()

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
    function addEvent<T = any>(name: string, data: T) {
      dispatch(action.event({ name, data }))
    }
    console.info('⚙️ Initializing GeolocationContext')
    console.info('♻️ Setting up event listeners')
    listeners.add(
      BackgroundGeolocation.onLocation(
        (location) => {
          if (location.sample) return
          console.log('[BGL::onLocation]', location)
          dispatch(action.location(location))
          addEvent('location', location)
        },
        (error) => console.warn('[onLocation] ERROR:', error),
      ),
    )
    listeners.add(
      BackgroundGeolocation.onProviderChange((event) => {
        console.log('[BGL::onProviderChange]', event.enabled, event.status)
        addEvent('provider changed', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onMotionChange((event) => {
        console.log('[BGL::onMotionChange]', event.isMoving, event.location)
        addEvent('motion changed', event)
        if (event.location.sample) return
        dispatch(action.location(event.location))
      }),
    )
    listeners.add(
      BackgroundGeolocation.onActivityChange((event) => {
        console.log('[BGL::onActivityChange]', event)
        addEvent('activity changed', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onGeofence((event) => {
        console.log('[BGL::onGeofence]', event)
        addEvent('geofence', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onHttp((event) => {
        console.log('[BGL::onHttp]', event)
        addEvent('http', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onHeartbeat(async (event) => {
        console.log('[BGL::onHeartbeat] - Heartbeat event')
        addEvent('heartbeat', { ping: 'pong', lastLocation: event.location })
        const location = await BackgroundGeolocation.getCurrentPosition({
          samples: 1,
          persist: false,
          timeout: 30,
        })
        console.log('[BGL::onHeartbeat] - Current position:', location)
        dispatch(action.location(location))
        addEvent('location', location)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onEnabledChange((enabled) => {
        console.log('[BGL::onEnabledChange]', enabled)
        addEvent('enabled changed', enabled)
        dispatch(action.update({ enabled }))
      }),
    )
    console.info(`✅ Event listeners set up: ${listeners.count}`)

    console.log('[BGL] calling BackgroundGeolocation.ready')

    // if (initialized) return cleanup

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
      const { enabled, debug } = state
      dispatch(action.event({ name: 'ready', data: state }))
      dispatch(action.update({ enabled, debug }))
      // initialized = true
    })

    const cleanup = () => {
      console.log('[BGL] Cleaning up Geolocation subscriptions')
      listeners.clear()
    }

    return cleanup
  }, [])

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
