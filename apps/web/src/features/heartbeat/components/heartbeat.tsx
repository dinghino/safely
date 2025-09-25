'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useMachine, useSelector } from '@xstate/react'
import { fromPromise, type ActorRefFromLogic, type StateFrom } from 'xstate'
import { NetworkIcon, PauseCircleIcon, PlayCircleIcon } from 'lucide-react'

import { api } from '@workspace/backend/api'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import { cn } from '@/lib/utils'
import dayjs from '@/lib/dayjs'
import { useWindowEvent } from '@/shared/hooks/use-window-event'
import type { Device } from '@/entities/device/types'

import machine from '../machine'

/**
 * Heartbeat component - manages heartbeat state machine to communicate with backend
 * and let it know the device is alive and well.
 * Optionally sends location data if available.
 *
 * todo: add location dispatch
 *  - through props
 *  - accessing geolocation context.
 *    - we can subscribe to the actor on location updates and store it locally
 *    - send a getLocation to it to get it back probably.
 *
 *  alternatively we can modify the state machine so that it KNOWS about the geolocation actor
 *  and can use it internally before sending heartbeats, providing the location to
 *  the dispatcher actor as `input`.
 */
export const Heartbeat = ({ deviceId }: { deviceId: string }) => {
  const device = useQuery(api.devices.get, { deviceId })
  const heartbeat = useMutation(api.devices.heartbeat)
  const disconnect = useMutation(api.devices.disconnect)

  async function dispatcher({ input }: { input: { interval?: number } }) {
    if (!device?._id) throw new Error('no deviceId')
    const { interval } = input
    const { sessionToken } = await heartbeat({ deviceId: device._id, interval /* , location */ })
    return sessionToken
  }
  async function disconnector(options: { input: { token: string } }) {
    const { token: sessionToken } = options.input
    if (!sessionToken) throw new Error('no session token')
    await disconnect({ sessionToken })
  }

  const [state, send, actor] = useMachine(
    machine.provide({
      actors: {
        dispatcher: fromPromise(dispatcher),
        disconnect: fromPromise(disconnector),
      },
    }),
    {
      input: { deviceId, interval: device?.settings.heartbeatIntervalMs },
    },
  )

  // update deviceId when it changes. this should never happen in practice
  useEffect(() => send({ type: 'setDeviceId', deviceId }), [deviceId, send])

  // dispatch new interval from device settings
  useEffect(() => {
    const { heartbeatIntervalMs: interval } = device?.settings ?? {}
    if (!interval) return
    send({ type: 'setInterval', interval })
  }, [send, device])

  /// before unloading the page, disconnect the device
  useWindowEvent('beforeunload', () => send({ type: 'disconnect' }))

  return !!device && <DemoDisplay state={state} actor={actor} send={send} device={device} />
}

type Actor = ActorRefFromLogic<typeof machine>
type Send = ActorRefFromLogic<typeof machine>['send']
type State = StateFrom<typeof machine>

type DemoProps = {
  state: State
  actor: Actor
  send: Send
  device: Device
}

const DemoDisplay = ({ state, actor, send, device }: DemoProps) => {
  const context = useSelector(actor, (state) => state.context)
  const token = useSelector(actor, (state) => state.context.token)
  const lastSent = useSelector(actor, (state) => state.context.lastHeartbeat)

  return (
    <div className="space-y-4">
      <div className="flex max-w-fit flex-col gap-2">
        <ButtonGroup>
          <Button
            size="icon"
            disabled={!state.can({ type: 'stop' })}
            onClick={() => send({ type: 'stop' })}
          >
            <PauseCircleIcon />
          </Button>
          <Button
            size="icon"
            disabled={!state.can({ type: 'start' })}
            onClick={() => send({ type: 'start' })}
          >
            <PlayCircleIcon />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            disabled={!state.can({ type: 'disconnect' })}
            onClick={() => send({ type: 'disconnect' })}
          >
            <NetworkIcon />
          </Button>
        </ButtonGroup>
        <TimeRemaining actor={actor} />
      </div>
      <div className="inline-flex items-center gap-2">
        <ButtonGroup>
          <Badge className="font-mono text-xs" variant="outline">
            device
          </Badge>
          <Badge variant="secondary">
            <div
              className={cn('aspect-square h-2 w-2 flex-1 rounded bg-purple-500', {
                'bg-red-500': device?.status === 'offline',
                'bg-green-500': device?.status === 'online',
                'bg-gray-500': device?.status === 'idle',
              })}
            />
          </Badge>
          <Badge>{device?.status}</Badge>
        </ButtonGroup>
        <ButtonGroup>
          <Badge className="font-mono text-xs" variant="outline">
            last sent
          </Badge>
          <Badge>{lastSent ? dayjs(lastSent).format('HH:mm:ss') : 'never'}</Badge>
        </ButtonGroup>
        <ButtonGroup>
          <Badge className="font-mono text-xs" variant="outline">
            machine
          </Badge>
          <Badge>{state.value}</Badge>
        </ButtonGroup>
      </div>
      <div>Device ID: {device.deviceId}</div>
      <pre>{token}</pre>
      <div>
        <pre>{JSON.stringify(context, null, 2)}</pre>
      </div>
    </div>
  )
}

const TimeRemaining = ({ actor }: { actor: Actor }) => {
  const interval = useSelector(actor, (s) => s.context.interval)
  const lastHeartbeat = useSelector(actor, (s) => s.context.lastHeartbeat)
  const isStopped = useSelector(actor, (s) => s.matches('stopped'))

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!interval || isStopped) return
    // Update timer every second
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [interval, isStopped])

  useEffect(() => {
    const set = () => setNow(Date.now())
    // Reset progress when interval changes or heartbeat occurs
    const changed = actor.on('intervalChanged', set)
    const sent = actor.on('heartbeat', set)
    const reset = actor.on('stopped', set)
    const start = actor.on('started', set)
    return () => {
      changed.unsubscribe()
      sent.unsubscribe()
      reset.unsubscribe()
      start.unsubscribe()
    }
  }, [actor])

  const value = useMemo(() => {
    if (isStopped) return 0
    if (!interval || !lastHeartbeat) return 0

    const elapsed = now - lastHeartbeat
    const progress = Math.min((elapsed / interval) * 100, 100)

    return Math.max(progress, 0)
  }, [now, lastHeartbeat, interval, isStopped])

  return (
    <div className="px-1">
      <Progress value={value} className="h-1" />
    </div>
  )
}
