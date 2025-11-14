'use client'
import { use } from 'react'
import { useQuery } from 'convex/react'

import { useQueryState } from '@workspace/nuqs'

import type { Device } from '@workspace/backend/types'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'

import { ButtonGroup } from '@workspace/ui/components/button-group'
// import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Wireframe } from '@workspace/ui/components/wireframe'

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
import { Circle } from 'react-leaflet'

// import { MapTiles } from '@/shared/modules/maps/map-layers'
// import { MapMarker, MapTooltip } from '@/shared/modules/maps'

import { formatLatLng } from '@/entities/location/lib'
import { getDeviceStatusColor } from '@/entities/device/lib/device-status-color'

import { LabeledBadge } from '@/components/labeled-badge'

import { DeviceIcon } from '@/features/device-manager'
import { SessionButton, useSessionData } from '@/features/device-tracking'

import { DeviceMarker, DevicePopup } from '@/widgets/maps'
import { SessionLayer } from '@/views/session-map'
import { DeviceActionsMenu } from '@/widgets/device-actions-menu'

type Props = {
  params: Promise<{ deviceId: Id<'devices'> }>
}

import { DeviceEventsLog } from '@/widgets/device-logs'
import { BatteryIcon, ClockIcon } from 'lucide-react'

export default function PageWireframe({ params }: Props) {
  const { deviceId } = use(params)
  const device = useQuery(api.devices.get.one, { deviceId })

  if (device === undefined) {
    return <div className="p-4">Loading...</div>
  }

  if (device === null) {
    return <div className="p-4">Device not found</div>
  }

  return (
    <div className={cn('relative isolate flex flex-col gap-4' /* DEBUG_CLASS */)}>
      <header className="flex min-h-32 flex-col justify-between gap-4 p-4">
        <div className="inline-flex w-full items-center gap-4">
          <DeviceIcon
            device={device}
            className={cn(
              'h-10 w-10 rounded-lg bg-sidebar p-2 ring-3',
              getDeviceStatusColor(device, 'ring'),
            )}
          />
          <h1 className="font-bold text-3xl">{device.name}</h1>
          {/* actions */}

          <div className="inline-flex w-full justify-end">
            <ButtonGroup>
              <SessionButton className="flex-1 justify-between" deviceId={device._id} />
              <ButtonGroup>
                <DeviceActionsMenu device={device} variant="outline" />
              </ButtonGroup>
            </ButtonGroup>
          </div>
        </div>
        <LabeledBadge label={device.status === 'online' ? 'Status' : 'Last Seen'}>
          <span className={cn(getDeviceStatusColor(device), 'size-2 rounded-md')} />
          {device.status === 'online' ? 'Online' : <LastSeen device={device} />}
        </LabeledBadge>
      </header>

      <div className="flex w-full">
        <Card className="flex-1 shrink-0">
          <CardHeader>
            <CardTitle className="font-bold text-xl">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Wireframe
              type="widget"
              className="sticky top-0 inline-flex h-12 w-full items-center gap-2 p-2"
              title="EventsToolbar"
            >
              <Wireframe className="h-6 w-24" />
              <Wireframe className="h-6 w-6" />
            </Wireframe>
            {/* <div className="space-y-2"> */}
            <DeviceEventsLog deviceId={deviceId} />
          </CardContent>
        </Card>
        <aside className="min-w-[650px] max-w-fit flex-0 shrink-0 px-4">
          <div className="sticky top-(--header-height) space-y-4 pt-4">
            {/* Status */}

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Glance at some of the device details and location on the map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <BatteryIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Battery</span>
                  </div>
                  {/* <span className="font-medium">{device.battery}%</span> */}
                  <span className="font-medium">84%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Seen</span>
                  </div>

                  <span className="font-medium">
                    {device.status === 'online' ? 'online' : dayjs(device.last_seen).toNow(true)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* map */}
            <Card className="overflow-hidden p-0!">
              <CardContent className="aspect-square max-w-full p-0!">
                {device && <DeviceMap device={device} />}
              </CardContent>
            </Card>

            <section className="space-y-2 p-2">
              <h2 className="font-bold">Information</h2>

              <Wireframe className="h-8 w-full" />
              <Wireframe className="h-8 w-9/10" />
            </section>
            <Wireframe type="view" className="space-y-2 p-2" title="latest sessions">
              <h2 className="font-bold">Latest Sessions</h2>
              <Wireframe type="widget" className="h-8 w-full" />
              <Wireframe type="widget" className="h-8 w-full" />
              <Wireframe type="widget" className="h-8 w-full" />
            </Wireframe>
          </div>
        </aside>
        {/* </div> */}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// OLD PAGE
//
// region old page
// ----------------------------------------------------------------------------

function LastSeen({ device }: { device: Device }) {
  if (!device.last_seen) {
    return <span className="text-xs">never</span>
  }

  const lastSeen = dayjs.duration(dayjs(device.last_seen).diff(dayjs())).humanize(true)
  return <span className="text-xs">{lastSeen}</span>
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
            <>
              <DeviceMarker device={device}>
                <DevicePopup />
              </DeviceMarker>
              {location?.metadata.accuracy && (
                <Circle
                  center={formatLatLng(location.coordinates)}
                  radius={location.metadata.accuracy}
                />
              )}
            </>
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
