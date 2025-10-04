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
import { ButtonGroup } from '@workspace/ui/components/button-group'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { Loader2, ChevronDown } from 'lucide-react'
import { Card } from '@workspace/ui/components/card'
import { HeartbeatDebugger } from '@/features/heartbeat/components/debugger'
import { SessionButton, useSessionManager } from '@/features/device-tracking'
import { SessionLocationsTable } from '@/widgets/geospatial-table'
import type { Id } from '@workspace/backend/dataModel'

export default function DemoPage() {
  // const [deviceId] = useDeviceId()
  // const device = useQuery(api.devices.get, { deviceId })
  return (
    <div className="space-y-4 py-8 content-grid">
      <GeolocationDemo />
      <div className="flex flex-row gap-4 max-lg:flex-col">
        <div className="flex-1">
          <HeartbeatDebugger />
        </div>
        <div className="flex-1">
          <SessionDebugger />
        </div>
      </div>
    </div>
  )
}

function GeolocationDemo() {
  const { state, send, actor, ...geo } = useGeolocationContext()

  // todo optimize selectors - move outside of component
  // const lastLocation = useSelector(actor, (state) => state.context?.data)
  const permission = useSelector(actor, (state) => state.context?.permissionStatus)
  const error = useSelector(actor, (state) => state.context?.error)

  // states
  const isStarting = useSelector(actor, (s) => s.matches('bootstrap'))
  const isRequestingPermission = useSelector(actor, (s) =>
    s.matches({ bootstrap: 'requestingPermission' }),
  )
  const isReady = useSelector(actor, (s) => s.matches('ready'))
  const isWatching = useSelector(actor, (s) => s.matches('watching'))
  const isRequesting = useSelector(actor, (s) => s.matches('requestingLocation'))

  const stateBadgeVariant =
    isReady || geo.isActive ? 'default' : isStarting ? 'secondary' : 'destructive'

  const badges = (
    <div className="inline-flex items-center gap-2">
      <ButtonGroup>
        <Badge variant="secondary" className="aspect-square">
          <div
            className={cn('aspect-square h-2 w-2 rounded bg-foreground', {
              'bg-green-500': isReady,
              'bg-yellow-500': isRequestingPermission,
              'bg-blue-500': geo.isActive || isStarting,
              'bg-red-500': !!error,
            })}
          />
        </Badge>
        <Badge variant={stateBadgeVariant}>State: {JSON.stringify(state.value)}</Badge>
        {error && <Badge variant="destructive">{error}</Badge>}
        <Badge variant="outline">
          {geo.current ? 'Location obtained' : 'No location obtained'}
        </Badge>
        <Badge variant="outline">Access: {permission}</Badge>
        <Badge variant="outline">
          Last update: {geo.timestamp > 0 ? dayjs(geo.timestamp).format('HH:mm:ss') : 'never'}
        </Badge>
      </ButtonGroup>
    </div>
  )

  const requestPermissions = () => send({ type: 'REQUEST_PERMISSION' })
  const requestPosition = () => send({ type: 'GET_POSITION', options: { maximumAge: 1000 } })
  const restart = () => send({ type: 'RESTART' })

  const actions = (
    <div className="inline-flex items-center gap-2">
      <CollapsibleTrigger asChild>
        <Button className="data-[state=open]:[&>_svg]:rotate-180">
          {!state.matches('ready') ? <Loader2 className="animate-spin" /> : <ChevronDown />}
        </Button>
      </CollapsibleTrigger>
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
        <Button disabled={geo.isActive} onClick={() => send({ type: 'START_WATCHING' })}>
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
  const status = (
    <Collapsible>
      {actions}
      <CollapsibleContent>
        <div className="relative isolate">
          {state.matches('requestingLocation') && (
            <div className="absolute z-10 h-full w-full bg-background/25">
              <Loader />
            </div>
          )}
          <pre>{JSON.stringify(state.context, null, 2)}</pre>
          <pre>{geo.current && JSON.stringify(geo.current, null, 2)}</pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <Card className="p-4">
      {/* <header className="max-h-fit">
        <div className="p-4">Demo Page</div>
      </header> */}
      <section className="flex flex-col gap-4">
        {badges}
        {status}
      </section>
    </Card>
  )
}

function SessionDebugger() {
  const [deviceId] = useDeviceId()

  const device = useQuery(api.devices.get, { deviceId })
  const session = useQuery(api.tracking.sessions.getActive, { deviceId: device?._id })

  const { state } = useSessionManager()

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-4 rounded bg-card p-2">
        {device && <SessionButton deviceId={device?._id} />}
        <Badge variant="secondary">{JSON.stringify(state.value)}</Badge>
      </div>
      <div className="overflow-x-auto rounded bg-card p-2">
        {session ? <SessionData sessionId={session._id} /> : <div>No active session</div>}
      </div>
      <pre>{JSON.stringify(state.context, null, 2)}</pre>
    </div>
  )
}

function SessionData({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const locations = useQuery(api.tracking.locations.getSession, { sessionId })

  return <SessionLocationsTable locations={locations ?? []} />
}
