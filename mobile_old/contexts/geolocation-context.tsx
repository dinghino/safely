import { createContext } from '@workspace/react-utils'
import { useCallback, useEffect, useState } from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'
import type {
  Location,
  State,
  CurrentPositionRequest,
  Subscription,
} from 'react-native-background-geolocation'

import { useDeviceContext } from './device-manager'
import { transformGetLocationOptions, transformSettings } from '@/lib/geolocation'
// import * as geo from '@/lib/geolocation.setup'
// import { Alert } from 'react-native'

export namespace GeolocationContext {
  export type Value = {
    ready: boolean
    enabled: boolean
    location: Location | null
    state: State | null
    getLocation: (options?: CurrentPositionRequest) => Promise<Location | null>
    changeConfig: (newConfig: Partial<State>) => Promise<void>
    start: () => Promise<void>
    stop: () => Promise<void>
    events: EventRecord[]
  }
  export type Props = {
    children: React.ReactNode
  }
  export type EventRecord<T = any> = {
    expanded: boolean
    timestamp: string
    name: string
    data: T
  }
}
/**
 * Promise to be resolved once the component mounted to trigger the setup
 * of the BackgroundGeolocation library.
 */
let resolver: (() => void) | null = null
const bootPromise = new Promise<void>((res) => {
  resolver = res
})

const [Provider, useGeolocation] = createContext<GeolocationContext.Value>('GeolocationContext')

export { useGeolocation }

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

export const GeolocationContext = ({ children }: GeolocationContext.Props) => {
  // tracks ready state of the plugin, i.e. if ready method has been called
  const [ready, setReady] = useState(false)
  // tracks enabled state of the plugin
  const [enabled, setEnabled] = useState(false)
  // last known location from device. should come from the event listeners
  // todo: this should be somehow updated when working in the background (read back on app focus?)
  const [location, setLocation] = useState<Location | null>(null)
  // current state of the plugin
  const [state, setState] = useState<State | null>(null)

  const { device } = useDeviceContext()

  // IDDIO CANE DELLE PROVE
  const [events, setEvents] = useState<any[]>([])

  const addEvent = (name: string, data: any) => {
    const timestamp = new Date()
    const event = {
      expanded: false,
      timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`,
      name: name,
      data,
    }
    setEvents((prev) => [...prev, event])
  }

  useEffect(() => {
    resolver?.()
    initialize().then((state) => {
      setEnabled(state.enabled)
      addEvent('Ready', state)
      setState(state)
      setReady(true)

      resolver = null
    })
    return () => {
      listeners.clear()
      setEvents([])
      setLocation(null)
      setState(null)
      setReady(false)
      setEnabled(false)
    }
  }, [])

  const initialize = async () => {
    console.info('⚙️ Initializing GeolocationContext')
    console.info('♻️ Setting up event listeners')
    await bootPromise
    // 1. subscribe to events
    listeners.add(
      BackgroundGeolocation.onLocation(
        (loc) => {
          console.log('[onLocation]', loc)
          addEvent('Location', loc)
          setLocation(loc)
        },
        (error) => console.warn('[onLocation] ERROR:', error),
      ),
    )
    listeners.add(
      BackgroundGeolocation.onProviderChange((event) => {
        console.log('[onProviderChange]', event.enabled, event.status)
        addEvent('ProviderChange', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onMotionChange((event) => {
        console.log('[onMotionChange]', event.isMoving, event.location)
        addEvent('MotionChange', event)
        setLocation(event.location)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onActivityChange((event) => {
        console.log('[onActivityChange]', event)
        addEvent('ActivityChange', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onGeofence((event) => {
        console.log('[onGeofence]', event)
        addEvent('Geofence', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onHttp((event) => {
        console.log('[onHttp]', event)
        addEvent('Http', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onHeartbeat((event) => {
        console.log('[onHeartbeat]', event)
        addEvent('Heartbeat', event)
      }),
    )
    listeners.add(
      BackgroundGeolocation.onEnabledChange((enabled) => {
        console.log('[onEnabledChange]', enabled)
        addEvent('EnabledChange', { enabled: enabled })
        setEnabled(enabled)
      }),
    )
    console.info(`✅ Event listeners set up: ${listeners.count}`)

    // 2. initialize the plugin
    if (!resolver) {
      console.warn('⚠️ GeolocationContext already initialized, skipping')
      return BackgroundGeolocation.getState()
    }
    // let fromDevice = {}
    // if (device) {
    //   fromDevice = transformSettings(device.settings)
    // }
    /// Configure the plugin.
    await BackgroundGeolocation.ready({
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      // transistorAuthorizationToken: token,
      distanceFilter: 10,
      enableHeadless: true,
      stopOnTerminate: false,
      startOnBoot: true,
      // ...fromDevice,
    })
    const state = await BackgroundGeolocation.start()
    console.log('⚙️ BackgroundGeolocation is ready:', state.enabled)

    return state
  }

  // useEffect(() => {
  //   const listeners = geo.setupEventListeners({ onLocation: setLocation })
  //   return () => geo.cleanupListeners(listeners)
  // }, [])

  // // background geolocation setup
  // useEffect(() => {
  //   // only init once - either we are ready or we don't have a resolver anymore
  //   // if (ready) return
  //   if (!resolver) return

  //   geo
  //     .initialize(promise)
  //     .then(async () => {
  //       await BackgroundGeolocation.start(async (state) => {
  //         console.log('⚙️ geolocation service started', state.enabled)
  //         setReady(true)
  //         setState(state)
  //         setEnabled(state.enabled)
  //       })
  //       // todo: transform state in a reducer since we update a bunch of fields at once?
  //     })
  //     .catch((error) => {
  //       console.error('🤬 BackgroundGeolocation failed to ready', error)
  //       setReady(false)
  //     })

  //   resolver()
  //   resolver = null
  // }, [])

  // dispatch config changes when device settings change
  useEffect(() => {
    if (!device) return
    if (!ready) return
    const newConfig = transformSettings(device.settings)
    BackgroundGeolocation.setConfig(newConfig)
  }, [device, ready])

  const getLocation = useCallback(async (options: CurrentPositionRequest = {}) => {
    try {
      // const settings = transformGetLocationOptions({ ...options }, device)
      const settings = transformGetLocationOptions({ ...options }, null)
      const location = await BackgroundGeolocation.getCurrentPosition(settings)
      setLocation(location)
      return location
    } catch (error) {
      console.error('Error getting location', error)
      return null
    }
  }, [])

  const changeConfig = async (newConfig: Partial<State>) => {
    const config = await BackgroundGeolocation.setConfig(newConfig)
    setState(config)
  }

  // keep enabled state in sync with the plugin state
  useEffect(() => setEnabled(state?.enabled ?? false), [state])

  const start = async () => {
    const state = await BackgroundGeolocation.start()
    setState(state)
  }
  const stop = async () => {
    const state = await BackgroundGeolocation.stop()
    setState(state)
  }

  const value: GeolocationContext.Value = {
    ready,
    enabled,
    // setEnabled,
    getLocation,
    changeConfig,
    start,
    stop,
    location,
    state,
    events,
  }

  return <Provider value={value}>{children}</Provider>
}

export default GeolocationContext
