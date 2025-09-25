'use client'

import { useSelector } from '@xstate/react'

import dayjs from '@/lib/dayjs'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

import Loader from '@/components/loader'
import { cn } from '@/lib/utils'
import { useGeolocationContext } from '@/features/geolocation'
import { useDeviceId } from '@/shared/hooks/use-device-id'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { Heartbeat } from '@/features/heartbeat/components/heartbeat'
import { ButtonGroup } from '@workspace/ui/components/button-group'

export default function DemoPage() {
  const [deviceId] = useDeviceId()
  const device = useQuery(api.devices.get, { deviceId })
  return (
    <div className="py-8 content-grid">
      <GeolocationDemo />
      {device && <Heartbeat deviceId={deviceId} />}
    </div>
  )
}

function GeolocationDemo() {
  const { state, send, actor } = useGeolocationContext()

  // todo optimize selectors - move outside of component
  const lastLocation = useSelector(actor, (state) => state.context?.data)
  const permission = useSelector(actor, (state) => state.context?.permissionStatus)
  const hasLastTimestamp = useSelector(actor, (state) => state.context?.timestamp > 0)
  const lastTimestamp = useSelector(actor, (state) => state.context?.timestamp)
  const error = useSelector(actor, (state) => state.context?.error)

  // states
  const isStarting = useSelector(actor, (s) => s.matches('bootstrap'))
  const isRequestingPermission = useSelector(actor, (s) =>
    s.matches({ bootstrap: 'requestingPermission' }),
  )
  const isReady = useSelector(actor, (s) => s.matches('ready'))
  const isWatching = useSelector(actor, (s) => s.matches('watching'))
  const isRequesting = useSelector(actor, (s) => s.matches('requestingLocation'))
  const isWorking = isWatching || isRequesting

  const stateBadgeVariant =
    isReady || isWorking ? 'default' : isStarting ? 'secondary' : 'destructive'

  const badges = (
    <div className="inline-flex items-center gap-2">
      <ButtonGroup>
        <Badge variant="secondary" className="aspect-square">
          <div
            className={cn('aspect-square h-2 w-2 rounded bg-foreground', {
              'bg-green-500': isReady,
              'bg-yellow-500': isRequestingPermission,
              'bg-blue-500': isWorking || isStarting,
              'bg-red-500': !!error,
            })}
          />
        </Badge>
        <Badge variant={stateBadgeVariant}>State: {JSON.stringify(state.value)}</Badge>
        {error && <Badge variant="destructive">{error}</Badge>}
        <Badge variant="outline">{lastLocation ? 'Location obtained' : 'No location obtained'}</Badge>
        <Badge variant="outline">Access: {permission}</Badge>
        <Badge variant="outline">
          Last update: {hasLastTimestamp ? dayjs(lastTimestamp).format('HH:mm:ss') : 'never'}
        </Badge>
      </ButtonGroup>
    </div>
  )

  const status = (
    <div className="relative isolate">
      {state.matches('requestingLocation') && (
        <div className="absolute z-10 h-full w-full bg-background/25">
          <Loader />
        </div>
      )}
      <pre>{lastLocation && JSON.stringify(lastLocation, null, 2)}</pre>
    </div>
  )

  const requestPermissions = () => send({ type: 'REQUEST_PERMISSION' })
  const requestPosition = () => send({ type: 'GET_POSITION', options: { maximumAge: 1000 } })
  const restart = () => send({ type: 'RESTART' })

  const actions = (
    <div className="inline-flex items-center gap-2">
      {state.matches('bootstrap') && (
        <Button disabled={isRequestingPermission || !!permission} onClick={requestPermissions}>
          Request Permission
        </Button>
      )}
      {state.can({ type: 'RESTART' }) && (
        <Button variant="secondary" disabled={!state.can({ type: 'RESTART' })} onClick={restart}>
          Restart
        </Button>
      )}
      {state.can({ type: 'GET_POSITION' }) && (
        <Button disabled={isRequesting} onClick={requestPosition}>
          Get Position
        </Button>
      )}
      {state.can({ type: 'START_WATCHING' }) && (
        <Button disabled={isWorking} onClick={() => send({ type: 'START_WATCHING' })}>
          Start Watching
        </Button>
      )}
      {state.can({ type: 'STOP_WATCHING' }) && (
        <Button
          variant="destructive"
          disabled={!isWatching}
          onClick={() => send({ type: 'STOP_WATCHING' })}
        >
          Stop Watching
        </Button>
      )}
    </div>
  )

  return (
    <div>
      {/* <header className="max-h-fit">
        <div className="p-4">Demo Page</div>
      </header> */}
      <section className="flex flex-col gap-4">
        {badges}
        {status}
        {actions}
      </section>
    </div>
  )
}
