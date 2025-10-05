import { createContext } from '@workspace/react-utils'
import { useEffect, useState } from 'react'
import BackgroundGeolocation, {
  type Location,
  type State as BGState,
  type CurrentPositionRequest,
} from 'react-native-background-geolocation'

export namespace GeolocationContext {
  export type Value = {
    ready: boolean
    enabled: boolean
    setEnabled: (enabled: boolean) => void
    location: Location | null
    state: BGState | null
    getLocation: (options?: CurrentPositionRequest) => Promise<Location | null>
  }
  export type Props = {
    children: React.ReactNode
  }
}

let resolver: (() => void) | null = null
const promise = new Promise<void>((res) => {
  resolver = res
})

const [Provider, useGeolocation] = createContext<GeolocationContext.Value>('GeolocationContext')

export { useGeolocation }

export const GeolocationContext = ({ children }: GeolocationContext.Props) => {
  const [ready, setReady] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [state, setState] = useState<BGState | null>(null)

  useEffect(() => {
    console.log('Adding BackgroundGeolocation listeners')
    const onLocation = BackgroundGeolocation.onLocation((location) => {
      console.info('Location event', location)
      setLocation(location)
    })
    const onMotionChange = BackgroundGeolocation.onMotionChange((event) => {
      console.info('Motion changed', event.isMoving, event.location)
      setLocation(event.location)
    })
    const onActivityChange = BackgroundGeolocation.onActivityChange((event) => {
      console.info('Activity changed', event)
    })
    const onProviderChange = BackgroundGeolocation.onProviderChange((event) => {
      console.info('Provider changed', event.enabled, event.status)
    })
    const onHeartbeat = BackgroundGeolocation.onHeartbeat((event) => {
      console.log('[onHeartbeat] ', event)

      // You could request a new location if you wish.
      BackgroundGeolocation.getCurrentPosition({
        samples: 1,
        persist: true,
      }).then((location) => {
        console.log('[getCurrentPosition] ', location)
        setLocation(location)
      })
    })
    return () => {
      console.log('Removing BackgroundGeolocation listeners')
      onLocation.remove()
      onMotionChange.remove()
      onActivityChange.remove()
      onProviderChange.remove()
      onHeartbeat.remove()
      BackgroundGeolocation.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    setup(promise)
      .then(async (state) => {
        console.info('🎉 BackgroundGeolocation is ready')
        setReady(true)
        setEnabled(state.enabled)
        setState(state)
        console.log('📍 getting current position')
        const data = await BackgroundGeolocation.getCurrentPosition({
          timeout: 30, // 30 second timeout to fetch location
          maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
          desiredAccuracy: 10, // Try to fetch a location with an accuracy of `10` meters.
          samples: 3,
        })
        console.log('Current position', data)
        setLocation(data)
      })
      .catch((error) => {
        console.error('🤬 BackgroundGeolocation failed to ready', error)
        setReady(false)
      })

    if (resolver) {
      resolver()
      resolver = null
    }
  }, [])

  useEffect(() => {
    if (ready && enabled)
      BackgroundGeolocation.start().then((value) => {
        console.log('BackgroundGeolocation started successfully', value)
      })
    else BackgroundGeolocation.stop()
  }, [enabled, ready])

  const getLocation = async (options: CurrentPositionRequest = {}) => {
    try {
      const location = await BackgroundGeolocation.getCurrentPosition(options)
      setLocation(location)
      return location
    } catch (error) {
      console.error('Error getting location', error)
      return null
    }
  }

  const value: GeolocationContext.Value = {
    ready,
    enabled,
    setEnabled,
    getLocation,
    location,
    state,
  }

  return <Provider value={value}>{children}</Provider>
}

export default GeolocationContext

async function setup(initPromise: Promise<void>) {
  await initPromise

  const state = await BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    // distanceFilter: 10,
    stopOnTerminate: false,
    debug: true,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    enableHeadless: true,
    startOnBoot: true,
    preventSuspend: true,
    heartbeatInterval: 60,
  })
  return state
}
