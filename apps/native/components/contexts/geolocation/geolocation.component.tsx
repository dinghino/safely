import { useEffect } from 'react'
import type { Subscription } from 'react-native-background-geolocation'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { GeolocationContext, useGeolocationReducer } from './geolocation.context'

type GeolocationProviderProps = {
  children: React.ReactNode
}

let initialized = false

function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, dispatch] = useGeolocationReducer()

  // biome-ignore lint/correctness/useExhaustiveDependencies: useReducer dispatch is stable
  useEffect(() => {
    const subscriptions: Subscription[] = []

    function addEvent<T = any>(type: string, data: T) {
      dispatch({ type: 'add_event', payload: { timestamp: Date.now(), type, data } })
    }
    console.log('[BGL] Setting up Geolocation subscriptions')

    subscriptions.push(
      BackgroundGeolocation.onEnabledChange((enabled) => {
        console.log('[BGL::onEnabledChange]', enabled)
        dispatch({ type: 'update', payload: { enabled } })
        addEvent('enabled_change', enabled)
      }),
    )
    subscriptions.push(
      BackgroundGeolocation.onLocation((location) => {
        if (location.sample) return
        console.log('[BGL::onLocation]', location)
        dispatch({ type: 'location', payload: location })
        addEvent('location', location)
      }),
    )
    subscriptions.push(
      BackgroundGeolocation.onHeartbeat(() => {
        console.log('[BGL::onHeartbeat] - Heartbeat event')
        addEvent('heartbeat', null)
      }),
    )

    function cleanup() {
      console.log('[BGL] Cleaning up Geolocation subscriptions')
      subscriptions.forEach((sub) => {
        sub.remove()
      })
    }
    console.log('[BGL] calling BackgroundGeolocation.ready')

    if (initialized) return cleanup

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopOnTerminate: false,
      startOnBoot: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      heartbeatInterval: 60,
      debug: true,
    }).then(async (state) => {
      // if (!state.enabled) {
      //   // biome-ignore lint/style/noParameterAssign: reassigning state parameter is intentional here
      //   state = await BackgroundGeolocation.start()
      // }
      console.log('[BGL] [ready] is ready:', state.enabled)
      const { enabled, debug } = state
      dispatch({ type: 'update', payload: { enabled, debug } })
      initialized = true
    })

    return cleanup
  }, [])

  const clearLocations = () => dispatch({ type: 'clear' })
  const clearEvents = () => dispatch({ type: 'clear_events' })

  const value = { ...state, dispatch, clearLocations, clearEvents }

  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export default GeolocationProvider
