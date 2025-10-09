import { createContext } from '@workspace/react-utils'
import { useCallback, useEffect, useState } from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'
import type { Location, State, CurrentPositionRequest } from 'react-native-background-geolocation'

import { useDeviceContext } from './device-manager'
import { transformGetLocationOptions, transformSettings } from '@/lib/geolocation'

export namespace GeolocationContext {
  export type Value = {
    ready: boolean
    enabled: boolean
    setEnabled: (enabled: boolean) => void
    location: Location | null
    state: State | null
    getLocation: (options?: CurrentPositionRequest) => Promise<Location | null>
  }
  export type Props = {
    children: React.ReactNode
  }
}
/**
 * Promise to be resolved once the component mounted to trigger the setup
 * of the BackgroundGeolocation library.
 */
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
  const [state, setState] = useState<State | null>(null)

  const { device } = useDeviceContext()

  useEffect(() => {
    console.log('Adding BackgroundGeolocation listeners')
    const onLocation = BackgroundGeolocation.onLocation((location) => {
      console.info('🗺️ Location event', location)
      setLocation(location)
    })
    const onMotionChange = BackgroundGeolocation.onMotionChange((event) => {
      console.info('🗺️ Motion changed', event.isMoving, event.location)
      setLocation(event.location)
    })
    const onActivityChange = BackgroundGeolocation.onActivityChange((event) => {
      console.info('🗺️ Activity changed', event)
    })
    const onProviderChange = BackgroundGeolocation.onProviderChange((event) => {
      console.info('🗺️ Provider changed', event.enabled, event.status)
    })
    const onHeartbeat = BackgroundGeolocation.onHeartbeat((event) => {
      console.log('[🗺️ onHeartbeat] ', event)
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
        // todo: transform state in a reducer since we update a bunch of fields at once?
        setReady(true)
        setEnabled(state.enabled)
        setState(state)
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
    if (!device) return
    if (!ready) return
    const newConfig = transformSettings(device.settings)
    BackgroundGeolocation.setConfig(newConfig)
  }, [device, ready])

  // useEffect(() => {
  //   if (ready && enabled)
  //     BackgroundGeolocation.start().then((value) => {
  //       console.log('BackgroundGeolocation started successfully', value)
  //     })
  //   else BackgroundGeolocation.stop()
  // }, [enabled, ready])

  const getLocation = useCallback(
    async (options: CurrentPositionRequest = {}) => {
      try {
        const settings = transformGetLocationOptions({ ...options }, device)
        const location = await BackgroundGeolocation.getCurrentPosition(settings)
        setLocation(location)
        return location
      } catch (error) {
        console.error('Error getting location', error)
        return null
      }
    },
    [device],
  )

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
