'use client'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'

import { toast } from 'sonner'
import { Point } from 'leaflet'

import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import { FancyMarkerIcon, MapMarker, MapPopup, MapTooltip } from '@/shared/modules/maps'

import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'

import { DeviceIcon, DeviceStatusBadge, DeviceStatusDot } from '@/entities/device/components'
import type { Device } from '@/entities/device/types'
import { formatLatLng } from '@/entities/location/lib'

export namespace DeviceMarker {
  type GISData = FunctionReturnType<typeof api.devices.location.getLast>
  export type Context = {
    device: Device
    data: GISData
  }
  export type Props = {
    device: Device
    children?: React.ReactNode
  }
}

const [Provider, useDeviceMarkerContext] = createContext<DeviceMarker.Context>('DeviceMarker')

/**
 * Context aware device map marker with fetch for last known location.
 * @note this is going to be refactored a bunch of times due to changes on data
 * shape and generalization.
 */
export function DeviceMarker({ device, children }: DeviceMarker.Props) {
  const data = useQuery(api.devices.location.getLast, { deviceId: device._id })

  if (!data) return null

  return (
    <MapMarker
      position={formatLatLng(data.coordinates)}
      icon={
        <FancyMarkerIcon className={cn('p-1')}>
          <DeviceIcon device={device} className="h-5 w-5" />
          <div className="-top-0.5 -right-0.5 absolute z-2 inline-flex rounded-full border-2 border-background bg-background">
            <DeviceStatusDot device={device} className="h-1.5 w-1.5" />
          </div>
        </FancyMarkerIcon>
      }
    >
      <Provider value={{ device, data }}>{children}</Provider>
    </MapMarker>
  )
}

/**
 * Playground component to share content between Tooltip and Popup while we play
 * around with both.
 */
function SharedContent() {
  const { device } = useDeviceMarkerContext()

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="inline-flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <DeviceIcon device={device} className="h-4 w-4" />

          <h4 className="font-bold text-md">{device.name}</h4>
        </div>
        <DeviceStatusBadge device={device} label={false} className="p-0.5" />
      </div>
      <ButtonGroup className="w-full">
        <Badge className="min-w-fit flex-0 text-xs" variant="secondary">
          seen
        </Badge>
        <Badge className="flex-1 justify-end text-end text-xs" variant="outline">
          {dayjs(device.last_seen).fromNow()}
        </Badge>
      </ButtonGroup>
      <Button size="sm" onClick={() => toast.info(`Clicked on device ${device.name}`)}>
        Learn more
      </Button>
    </div>
  )
}

export function DeviceTooltip(props: React.ComponentProps<typeof MapTooltip>) {
  return (
    <MapTooltip interactive opacity={1} {...props}>
      <SharedContent />
    </MapTooltip>
  )
}

export function DevicePopup() {
  return (
    <MapPopup autoPan offset={new Point(0, -5)}>
      <SharedContent />
    </MapPopup>
  )
}
