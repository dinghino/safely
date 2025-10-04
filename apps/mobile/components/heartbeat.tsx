import { fromPromise } from 'xstate'
import { useMachine, useSelector } from '@xstate/react'
import { useMutation } from 'convex/react'

import { api } from '@workspace/backend/api'
import machine from '@workspace/heartbeat'
import type { Heartbeat } from '@workspace/heartbeat/types'

import { useDeviceContext } from '@/contexts/device-manager'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

export const HeartbeatManager = () => {
  const { device } = useDeviceContext()
  const heartbeat = useMutation(api.devices.heartbeat)
  const disconnect = useMutation(api.devices.disconnect)

  async function dispatcher({ input }: { input: Heartbeat.Dispatcher.Input }) {
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

  const [state, send, actor] = useMachine(
    machine.provide({
      actors: {
        dispatcher: fromPromise(dispatcher),
        disconnect: fromPromise(disconnectFn),
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

  const deviceId = useSelector(actor, (state) => state.context.deviceId)

  useEffect(() => {
    if (!device?._id) return
    if (deviceId === device?._id) return
    send({ type: 'setDeviceId', deviceId: device._id })
  }, [deviceId, device?._id, send])

  // dispatch new interval from device settings
  useEffect(() => {
    const { heartbeatIntervalMs: interval } = device?.settings ?? {}
    if (!interval) return
    send({ type: 'setInterval', interval })
  }, [send, device])

  useEffect(() => () => send({ type: 'disconnect' }), [send])

  // todo: handle something similar to beforeunload but for react native.
  // we technically do not want to disconnect when the app is backgrounded
  // but we might want to when it is terminated.

  return null

  // return (
  //   <View style={{ gap: 4 }}>
  //     <Text>Heartbeat Manager</Text>
  //     <Text>{JSON.stringify(state.context)}</Text>
  //   </View>
  // )
}
