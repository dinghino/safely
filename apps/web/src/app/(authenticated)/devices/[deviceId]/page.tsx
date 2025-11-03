'use client'
import { Suspense, use, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { HistoryIcon, MoreVerticalIcon } from 'lucide-react'
import { useQueryState } from '@workspace/nuqs'

import type { Device } from '@workspace/backend/types'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'

import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Button } from '@workspace/ui/components/button'
// import { Badge } from '@workspace/ui/components/badge'

import { cn } from '@/lib/utils'
import { dayjs } from '@/lib/dayjs'

import {
  Map as LeafletMap,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapTileLayer,
  MapZoomControl,
} from '@/shared/modules/maps'
import { AutoCenterMap } from '@/shared/modules/maps/components'

// import { MapTiles } from '@/shared/modules/maps/map-layers'
// import { MapMarker, MapTooltip } from '@/shared/modules/maps'

import { formatLatLng } from '@/entities/location/lib'
import { getDeviceStatusColor } from '@/entities/device/lib/device-status-color'

import { LabeledBadge } from '@/components/labeled-badge'

import { DeviceIcon } from '@/features/device-manager'
import { SessionButton, useAllSessions, useSessionData } from '@/features/device-tracking'

import { DeviceMarker, DevicePopup } from '@/widgets/maps'
import { SessionSelect, SessionTitle } from '@/widgets/sessions'
import { SessionLayer } from '@/views/session-map'
import { SessionInfo } from '@/views/session-details-pane'

type Props = {
  params: Promise<{ deviceId: Id<'devices'> }>
}

const DEBUG_CLASS = '**:outline **:outline-red-500/10'
const DEBUGGING = false

// todo: extract map (also see session-map.tsx)
// todo: add active session layer if active session exists
// todo: add general stats about the device
// todo: make RPC to get user profile by id for header

export default function DevicePage({ params }: Props) {
  const { deviceId } = use(params)
  const device = useQuery(api.devices.get.one, { deviceId })
  const sessions = useAllSessions(deviceId)

  const closedSessions = useMemo(
    () => sessions?.filter((session) => session.endedAt) ?? [],
    [sessions],
  )

  // todo: move to separate dynamic route
  const [selectedSession, selectSession] = useQuerySessionId()

  if (device === undefined) {
    return <div className="p-4">Loading...</div>
  }

  if (device === null) {
    return <div className="p-4">Device not found</div>
  }

  return (
    <div className={cn({ [DEBUG_CLASS]: DEBUGGING })}>
      <div className="space-y-4 py-4 content-grid">
        <DevicePageHeader device={device} />
      </div>
      <div className="space-y-4 content-grid">
        <section>
          <div className="rounded-lg border">
            <Suspense fallback={<div className="p-4">Loading map...</div>}>
              <DeviceMap device={device} />
            </Suspense>
          </div>
        </section>
        <section className="flex flex-col gap-4 min-lg:flex-row">
          <div className="min-w-fit flex-1 space-y-4 p-4">
            <h2 className="mb-2 font-bold text-2xl">Sessions list</h2>
            <div className="flex w-full flex-col gap-2">
              {closedSessions?.map((session) => (
                <Button
                  variant="outline"
                  className={cn('inline-flex w-full cursor-pointer items-center gap-2 px-4')}
                  key={session._id}
                  onClick={() => selectSession(session._id)}
                >
                  <SessionTitle session={session} className="justify-start gap-1" />
                </Button>
              ))}
            </div>
          </div>
          <div className="max-w-[300px] p-4">
            <h2 className="mb-2 font-bold text-2xl">Selected session data</h2>
            {selectedSession && (
              <Suspense fallback={<div>Loading session...</div>}>
                <SessionInfo sessionId={selectedSession} />
              </Suspense>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function DevicePageHeader({ device }: { device: Device }) {
  const [selectedSession, selectSession] = useQuerySessionId()

  const badges = (
    <div className="relative inline-flex flex-1 flex-nowrap items-center gap-3 overflow-x-scroll py-3">
      <LabeledBadge label={<>Status</>}>
        <span className={cn(getDeviceStatusColor(device), 'size-2 rounded-full')} />
        <span className="text-xs">{device.status === 'online' ? 'Online' : 'Offline'}</span>
      </LabeledBadge>
      <LabeledBadge label="Last seen">
        {device.last_seen
          ? dayjs.duration(dayjs(device.last_seen).diff(dayjs())).humanize(true)
          : 'never'}
      </LabeledBadge>
      <LabeledBadge label="Mode">{device.mode}</LabeledBadge>
    </div>
  )

  return (
    <>
      <header className="flex w-full flex-col gap-2">
        <div className="inline-flex items-center gap-4">
          <DeviceIcon
            device={device}
            className={cn(
              'h-10 w-10 rounded-full bg-sidebar p-2 ring-3',
              getDeviceStatusColor(device, 'ring'),
            )}
          />
          <h1 className="font-bold text-3xl">{device.name}</h1>
        </div>
        <p className="text-muted-foreground text-xs">
          owned by <span className="rounded-md bg-sidebar p-1 font-mono">{device.owner}</span>
        </p>
      </header>

      <div className="inline-flex max-w-full items-center justify-between p-1">
        {badges}

        <ButtonGroup>
          <SessionButton deviceId={device._id} />
          <ButtonGroup>
            <div className="flex items-center rounded-lg border bg-muted p-2 text-muted-foreground">
              <HistoryIcon className="size-4" />
            </div>
            <SessionSelect
              deviceId={device._id}
              onValueChange={selectSession}
              defaultValue={selectedSession ?? undefined}
            />
          </ButtonGroup>
          <ButtonGroup>
            <Button size="icon" variant="secondary">
              <MoreVerticalIcon />
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </>
  )
}

function DeviceMap(props: { device: Device }) {
  const { device } = props
  const location = useQuery(api.devices.location.getLast, { deviceId: device._id })
  const [sessionId] = useQuerySessionId()

  return (
    <LeafletMap
      bounds={[]}
      center={location ? formatLatLng(location.coordinates) : [0, 0]}
      className="h-full w-full"
    >
      <AutoCenterMap coordinates={location?.coordinates} zoom={16} />
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['device']}>
        <MapTileLayer />
        {sessionId && <SelectedSessionLayer sessionId={sessionId} />}
        <MapLayerGroup name="device">
          {device && (
            <DeviceMarker device={device}>
              <DevicePopup />
            </DeviceMarker>
          )}
        </MapLayerGroup>

        <ButtonGroup
          orientation="vertical"
          className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
        >
          <MapZoomControl orientation="vertical" className="static" />
          <ButtonGroup orientation="vertical">
            <MapLocateControl className="static" />
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <MapLayersControl className="static" />
          </ButtonGroup>
        </ButtonGroup>
      </MapLayers>
    </LeafletMap>
  )
}

function SelectedSessionLayer({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const locations = useSessionData(sessionId)
  return <SessionLayer name="selected-session" locations={locations} />
}

//////////////////

function useQuerySessionId() {
  return useQueryState<Id<'trackSession'> | null>('s', {
    parse: (v) => v as Id<'trackSession'> | null,
  })
}
