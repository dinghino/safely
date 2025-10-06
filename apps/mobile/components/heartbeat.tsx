import { useEffect } from 'react'
import { fromCallback, fromPromise } from 'xstate'
import { useMachine, useSelector } from '@xstate/react'
import { useMutation } from 'convex/react'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { api } from '@workspace/backend/api'
import machine, { type Heartbeat } from '@workspace/heartbeat'

import { useDeviceContext } from '@/contexts/device-manager'
import { useGeolocation } from '@/contexts/geolocation-context'
import { transformLocation } from '@/lib/geolocation'

export const HeartbeatManager = () => {
  const { device } = useDeviceContext()
  const heartbeat = useMutation(api.devices.heartbeat)
  const disconnect = useMutation(api.devices.disconnect)

  const dispatcher = async ({ input }: { input: Heartbeat.Dispatcher.Input }) => {
    // error is caught by state machine we need to throw
    if (!device?._id) throw new Error('No device ID set')
    const { sessionToken } = await heartbeat({ deviceId: device._id, ...input })
    return sessionToken
  }
  const disconnectFn = async ({ input }: { input: { token: string } }) => {
    const { token: sessionToken } = input
    if (!sessionToken) return
    await disconnect({ sessionToken })
  }

  const geolocation = useGeolocation()

  const [_state, send, actor] = useMachine(
    machine.provide({
      actors: {
        dispatcher: fromPromise(dispatcher),
        disconnect: fromPromise(disconnectFn),
        // getPosition: fromPromise(({ input }) => getPosition(input.options)),
        getPosition: fromPromise(async ({ input }) => {
          const data = await geolocation.getLocation({
            samples: 3,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
            ...input.options,
          })
          if (!data) throw new Error('Failed to get location')
          return transformLocation(data)
        }),
        setup: fromCallback(({ sendBack }) => {
          const onLocation = BackgroundGeolocation.onLocation((location) => {
            console.log('📍 BackgroundGeolocation location', location)
            sendBack({ type: 'locationUpdate', location: transformLocation(location) })
          })
          // get an initial location to send heartbeat faster
          BackgroundGeolocation.getCurrentPosition({
            samples: 1,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
            timeout: device?.settings.heartbeatIntervalMs,
          }) //.then((loc) => sendBack({ type: 'locationUpdate', location: transformLocation(loc) }))

          return () => {
            onLocation.remove()
          }
        }),
      },
    }),
    {
      input: {
        geolocatorActor: null,
        deviceId: device?._id,
        interval: device?.settings.heartbeatIntervalMs,
      },
    },
  )

  // useEffect(() => {
  //   console.log('Heartbeat state changed', _state.value, _state.context)
  // }, [_state])

  const deviceId = useSelector(actor, (state) => state.context.deviceId)
  const currentInterval = useSelector(actor, (state) => state.context.interval)

  // when the geolocation system is ready tell the heartbeat machine that we can
  // geolocate and to start - start won't have effect if already started, but
  // the canGeolocate event will prompt the machine to query the location when
  // needed.
  useEffect(() => {
    if (geolocation.ready) {
      send({ type: 'canGeolocate' })
      send({ type: 'start' })
    }
  }, [geolocation.ready, send])

  // set the device ID when it becomes available - this should only happen once
  // and will trigger the machine to start sending heartbeats for the device (?)
  useEffect(() => {
    if (!device?._id) return
    if (deviceId === device?._id) return
    send({ type: 'setDeviceId', deviceId: device._id })
  }, [deviceId, device?._id, send])

  // update settings when they we get updated ones from the server.
  // todo: handle all the settings - for now we only do interval
  useEffect(() => {
    const { heartbeatIntervalMs: interval } = device?.settings ?? {}
    if (!interval || interval === currentInterval) return
    console.log('updating heartbeat interval to', interval)
    send({ type: 'setInterval', interval })
  }, [send, currentInterval, device])

  // disconnect when unmounting
  // todo: we might want to NOT disconnect when the app is backgrounded
  // and instead run a background task or something, but they are unreliable
  useEffect(() => () => send({ type: 'disconnect' }), [send])

  return null
}
