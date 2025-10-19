import { Component } from 'react'
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native'
import BackgroundFetch from 'react-native-background-fetch'

import BGL, {} from 'react-native-background-geolocation'

import type {
  AuthorizationEvent,
  ConnectivityChangeEvent,
  GeofenceEvent,
  GeofencesChangeEvent,
  HeartbeatEvent,
  HttpEvent,
  Location,
  LocationError,
  MotionActivityEvent,
  MotionChangeEvent,
  ProviderChangeEvent,
  State,
  Subscription,
} from 'react-native-background-geolocation'
type EventRecord<T = any> = {
  expanded: boolean
  timestamp: string
  name: string
  data: T
}
type ComponentState = {
  ready: boolean
  events: EventRecord[]
  location: Location | null
}
const diocane = false

class LocationTracker extends Component<{}, ComponentState> {
  subscriptions: Map<string, Subscription>
  state: ComponentState

  constructor(props: any) {
    super(props)
    this.subscriptions = new Map()
    this.state = {
      ready: false,
      events: [],
      location: null,
    }
  }

  onLocation = (location: Location) => {
    console.log('[location 01] -', location)
    this.addEvent('location', location)
    this.setState({ location })
  }
  onError = (error: LocationError) => {
    console.warn('[location 01] ERROR -', error)
    this.addEvent('location error', error)
  }
  onMotionChange = (event: MotionChangeEvent) => {
    console.info('🗺️ [onMotionChange]', event.isMoving, event.location)
    this.addEvent('MotionChange', event)
    this.setState({ location: event.location })
  }
  onHeartbeat = (event: HeartbeatEvent) => {
    console.log('[🗺️ onHeartbeat] ', event)
    this.addEvent('Heartbeat', event)
  }
  onEnabledChange = (enabled: boolean) => {
    console.log('[enabled] -', enabled)
    this.addEvent('enabled', enabled)
  }
  onProviderChange = (event: ProviderChangeEvent) => {
    console.log('[onProviderChange]', event.enabled, event.status)
    this.addEvent('ProviderChange', event)
  }
  onHttp = (event: HttpEvent) => {
    console.log('[🗺️ onHttp] ', event)
    this.addEvent('Http', event)
  }
  onActivityChange = (event: MotionActivityEvent) => {
    console.info('🗺️ [onActivityChange]', event)
    this.addEvent('ActivityChange', event)
  }
  onGeofence = (event: GeofenceEvent) => {
    console.info('🗺️ [onGeofence]', event)
    this.addEvent('Geofence', event)
  }
  onGeofencesChange = (event: GeofencesChangeEvent) => {
    console.info('🗺️ [onGeofencesChange]', event)
    this.addEvent('GeofencesChange', event)
  }
  onSchedule = (state: State) => {
    console.info('🗺️ [onSchedule]', state)
    this.addEvent('Schedule', state)
  }
  onConnectivityChange = (event: ConnectivityChangeEvent) => {
    console.info('🗺️ [onConnectivityChange]', event)
    this.addEvent('ConnectivityChange', event)
  }
  onPowerSaveChange = (enabled: boolean) => {
    console.info('🗺️ [onPowerSaveChange]', { enabled })
    this.addEvent('PowerSaveChange', { enabled })
  }
  onAuthorization = (event: AuthorizationEvent) => {
    console.info('🗺️ [onAuthorization]', event)
    this.addEvent('Authorization', event)
  }
  onNotificationAction = (buttonId: string) => {
    console.info('🗺️ [onNotificationAction]', { buttonId })
    this.addEvent('NotificationAction', { buttonId })
  }
  initBackgroundFetch = async () => {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        stopOnTerminate: true,
      },
      (taskId) => {
        console.log('[BackgroundFetch] ', taskId)
        BackgroundFetch.finish(taskId)
      },
      (taskId) => {
        console.log('[BackgroundFetch] TIMEOUT: ', taskId)
        BackgroundFetch.finish(taskId)
      },
    )
  }
  // lifecycle

  componentDidMount = async (): Promise<void> => {
    // Subscriptions -- remove pointless ones, for now we just want to see something :'(
    // await this.initBackgroundFetch()

    this.register('location', BGL.onLocation(this.onLocation, this.onError))
    this.register('heartbeat', BGL.onHeartbeat(this.onHeartbeat))
    this.register('http', BGL.onHttp(this.onHttp))

    this.register('enabled_change', BGL.onEnabledChange(this.onEnabledChange))
    this.register('motion_change', BGL.onMotionChange(this.onMotionChange))
    this.register('provider_change', BGL.onProviderChange(this.onProviderChange))

    this.register('geofence', BGL.onGeofence(this.onGeofence))
    this.register('schedule', BGL.onSchedule(this.onSchedule))

    this.register('activity_change', BGL.onActivityChange(this.onActivityChange))
    this.register('geofences_change', BGL.onGeofencesChange(this.onGeofencesChange))
    this.register('connectivity_change', BGL.onConnectivityChange(this.onConnectivityChange))
    this.register('power_save_change', BGL.onPowerSaveChange(this.onPowerSaveChange))

    this.register('authorization', BGL.onAuthorization(this.onAuthorization))
    this.register('notification_action', BGL.onNotificationAction(this.onNotificationAction))

    BGL.on(BGL.EVENT_HEARTBEAT, (e: HeartbeatEvent) => {
      console.log('[EVENT_HEARTBEAT]', e)
    })
    BGL.on(BGL.EVENT_LOCATION, (e: Location) => {
      console.log('[EVENT_LOCATION]', e)
    })

    console.log('♻️ Subscriptions registered:', Array.from(this.subscriptions.keys()))
    // ready the plugin
    console.log('⏱️ Initializing BackgroundGeolocation...')
    let state: State | undefined
    try {
      const method = diocane ? BGL.setConfig : BGL.ready
      state = await method({
        desiredAccuracy: BGL.DESIRED_ACCURACY_HIGH,
        distanceFilter: 25,
        // debugging
        reset: true,
        // debug: true,
        logLevel: BGL.LOG_LEVEL_VERBOSE,
        // background ops
        stopOnTerminate: false,
        startOnBoot: true,
        // enableHeadless: true,
        preventSuspend: true,
        // heartbeat
        heartbeatInterval: 60,
        // notifications and permissions
        locationAuthorizationRequest: 'Always',
        backgroundPermissionRationale: {
          title: 'Allow access to your location',
        },
        notification: {
          title: 'Safely.PET',
          priority: BGL.NOTIFICATION_PRIORITY_HIGH,
          text: 'Location service is running',
          channelName: 'Location',
          sticky: true,
        },
      })
      console.log('✅ BackgroundGeolocation is ready: ', state.enabled)
      this.setState({ ready: true })
      this.addEvent('ready', state)
      console.log('🎉 LocationTracker ready')
    } catch (error) {
      console.error('❌ LocationTracker failed to initialize', error)
      throw error
    }

    // start it
    if (!state.enabled) {
      const startedState = await BGL.start()
      console.log('- Start success', startedState.enabled)
      this.addEvent('start', startedState)
    }
  }
  componentWillUnmount(): void {
    this.cleanup()
    // BGL.removeAllListeners()
  }

  getLocation = () => {
    console.log('⏱️ getCurrentPosition...')
    BGL.getCurrentPosition(
      {
        timeout: 30,
        maximumAge: 1_000,
        desiredAccuracy: BGL.DESIRED_ACCURACY_HIGH,
        // samples: 5,
      },
      (location) => {
        console.log('[getCurrentPosition location] -', location)
        this.setState({ location })
      },
    )
  }

  renderEvent = (event: EventRecord) => {
    return (
      <View key={event.timestamp} style={styles.eventContainer}>
        <View style={styles.eventHeader}>
          <View style={styles.eventContent}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventTimestamp}>{event.timestamp}</Text>
          </View>
          <View style={styles.eventActions}>
            <Button
              title={event.expanded ? 'Collapse' : 'Expand'}
              onPress={() => this.toggleCollapse(event)}
            />
            {/* delete button */}
            <Button title="Delete" onPress={() => this.removeEvent(event)} />
          </View>
        </View>
        {event.expanded && (
          <Text style={styles.eventData}>{JSON.stringify(event.data, null, 2)}</Text>
        )}
      </View>
    )
  }

  status = () => {
    const { ready } = this.state
    const backgroundColor = ready ? '#4CAF50' : '#F44336'
    return (
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor,
          // boxShadow: '0 0 8px -4px #0007',
        }}
      />
    )
  }

  render() {
    const { events, location } = this.state

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          {this.status()}
          <View style={{ flex: 1 }}>
            <Button title="Get Current Position" onPress={this.getLocation} />
          </View>
          <Button title="Clear Events" onPress={this.clearEvents} />
        </View>
        <ScrollView style={{ flex: 1, width: '100%' }}>
          {events.map(this.renderEvent)}
          {location && (
            <View style={styles.eventContainer}>
              <Text style={styles.eventName}>Last Known Location</Text>
              <Text style={styles.eventData}>{JSON.stringify(location, null, 2)}</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    )
  }

  private addEvent = (name: string, data: any) => {
    const timestamp = new Date()
    const event = {
      expanded: false,
      timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`,
      name: name,
      data,
    }
    this.setState((state) => {
      return { ...state, events: [...state.events, event] }
    })
  }
  private toggleCollapse = (event: EventRecord) => {
    this.setState((state) => {
      return {
        ...state,
        events: state.events.map((e) =>
          e.timestamp === event.timestamp ? { ...e, expanded: !e.expanded } : e,
        ),
      }
    })
  }
  private removeEvent = (event: EventRecord) => {
    this.setState((state) => {
      return {
        ...state,
        events: state.events.filter((e) => e.timestamp !== event.timestamp),
      }
    })
  }
  private register = (name: string, sub: Subscription) => {
    this.subscriptions.set(name, sub)
  }
  private cleanup = () => {
    this.subscriptions.forEach((subscription) => {
      subscription.remove()
    })
    this.subscriptions.clear()
  }
  clearEvents = () => {
    this.setState({ events: [] })
  }
}

export default LocationTracker

// let runInitializer: (() => void) | null = null
// const mountedPromise = new Promise<void>((res) => {
//   runInitializer = res
// })

// async function initialize(promise: Promise<void>) {
//   await promise
//   if (!runInitializer) {
//     console.warn('⚠️ runInitializer is null on GPS Tab mount')
//     return BackgroundGeolocation.getState()
//   }
//   console.log('Initializing BackgroundGeolocation...')
//   const state = await BackgroundGeolocation.ready({
//     desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//     distanceFilter: 50,
//     debug: true,
//     logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//     stopOnTerminate: false,
//     startOnBoot: true,
//     enableHeadless: true,
//   })
//   console.log('✅ BackgroundGeolocation is ready: ', state.enabled)
//   runInitializer = null
//   return state
// }

// export function GPSTab() {
//   const [events, setEvents] = useState<EventRecord[]>([])
//   const [location, setLocation] = useState<Location | null>(null)
//   const addEvent = useCallback((name: string, data: any) => {
//     const timestamp = new Date()
//     const event = {
//       expanded: false,
//       timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`,
//       name: name,
//       data,
//     }
//     setEvents((prev) => [...prev, event])
//   }, [])

//   // const onLocation = useCallback(
//   //   (location: Location) => {
//   //     console.log('[location] -', location)
//   //     addEvent('location', location)
//   //   },
//   //   [addEvent],
//   // )
//   // const onError = useCallback(
//   //   (error: any) => {
//   //     console.warn('[location] ERROR -', error)
//   //     addEvent('location error', error)
//   //   },
//   //   [addEvent],
//   // )

//   useEffect(() => {
//     console.log('GPS Tab mounted')
//     console.log('Setting up subscriptions...')
//     const subscriptions: Subscription[] = []
//     subscriptions.push(
//       BackgroundGeolocation.onLocation(
//         (location: Location) => {
//           console.log('[location 01] -', location)
//           addEvent('location', location)
//           setLocation(location)
//         },
//         (error: any) => {
//           console.warn('[location 01] ERROR -', error)
//           addEvent('location error', error)
//         },
//       ),
//     )
//     subscriptions.push(
//       BackgroundGeolocation.onEnabledChange((enabled: boolean) => {
//         console.log('[enabled] -', enabled)
//         addEvent('enabled', enabled)
//       }),
//     )

//     initialize(mountedPromise)
//     runInitializer?.()

//     // BackgroundGeolocation.ready({
//     //   desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//     //   distanceFilter: 50,
//     //   debug: true,
//     //   logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//     //   stopOnTerminate: false,
//     //   startOnBoot: true,
//     // }).then((state: State) => {
//     //   console.log('- BackgroundGeolocation is ready: ', state.enabled)
//     //   addEvent('ready', state)
//     // })

//     return () => {
//       console.log('GPS Tab unmounted. clearing subscriptions...')
//       subscriptions.forEach((subscription) => {
//         subscription.remove()
//       })
//     }
//   }, [addEvent])

//   const renderEvent = (event: EventRecord) => {
//     return (
//       <View key={event.timestamp} style={styles.eventContainer}>
//         <View style={styles.eventHeader}>
//           <View style={styles.eventContent}>
//             <Text style={styles.eventName}>{event.name}</Text>
//             <Text style={styles.eventTimestamp}>{event.timestamp}</Text>
//           </View>
//           <View style={styles.eventActions}>
//             <Button
//               title={event.expanded ? 'Collapse' : 'Expand'}
//               onPress={() => {
//                 setEvents((prev) =>
//                   prev.map((e) =>
//                     e.timestamp === event.timestamp ? { ...e, expanded: !e.expanded } : e,
//                   ),
//                 )
//               }}
//             />
//             {/* delete button */}
//             <Button
//               title="Delete"
//               onPress={() => {
//                 setEvents((prev) => prev.filter((e) => e.timestamp !== event.timestamp))
//               }}
//             />
//           </View>
//         </View>
//         {event.expanded && (
//           <Text style={styles.eventData}>{JSON.stringify(event.data, null, 2)}</Text>
//         )}
//       </View>
//     )
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Button
//         title="Get Current Position"
//         onPress={async () => {
//           const location: Location = await BackgroundGeolocation.getCurrentPosition({
//             timeout: 30,
//             maximumAge: 10_000,
//             desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//             samples: 5,
//           })
//           console.log('[getCurrentPosition location] -', location)
//           setLocation(location)
//         }}
//       />
//       <ScrollView style={{ flex: 1, width: '100%' }}>
//         {events.map(renderEvent)}
//         {location && (
//           <View style={styles.eventContainer}>
//             <Text style={styles.eventName}>Last Known Location</Text>
//             <Text style={styles.eventData}>{JSON.stringify(location, null, 2)}</Text>
//           </View>
//         )}
//       </ScrollView>
//     </ScrollView>
//   )
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  header: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  eventContainer: {
    padding: 10,
    borderBottomWidth: 1,
    backgroundColor: '#f9f9f9',
    borderBottomColor: '#ddd',
    marginBottom: 10,
    display: 'flex',
    // flexDirection: 'row',
    gap: 10,
  },
  eventHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventContent: { flex: 1 },
  eventActions: { flexDirection: 'row', gap: 10 },
  eventName: { fontSize: 16, fontWeight: 'bold' },
  eventTimestamp: { fontSize: 12, color: '#666' },
  eventData: { marginTop: 5, fontFamily: 'monospace', fontSize: 12 },
})

// -----------------------------------------------------------------------------

/*

const initialize = useCallback(async () => {
  const subscription = BackgroundGeolocation.onLocation(onLocation, onError)
  if (!resolver) {
    console.warn('⚠️ resolver is null on GPS Tab mount')
    return [subscription]
  }

  await bootPromise
  let state = await BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 50,
    debug: true,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false,
    startOnBoot: true,
  })

  console.log('- BackgroundGeolocation is ready: ', state.enabled)
  addEvent('ready', state)
  if (state.enabled) {
    return [subscription]
  }
  console.log('- BackgroundGeolocation is ready: ', state.enabled)
  state = await BackgroundGeolocation.start(
    () => {
      console.log('- Start success', state?.enabled)
    },
    (error) => {
      console.warn('- Start failure: ', error)
    },
  )
  addEvent('start', state)
  return [subscription]
}, [onError, onLocation, addEvent])
*/
