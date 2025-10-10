'use client'
import { useQuery } from 'convex/react'
import { MonitorIcon, SmartphoneIcon, type LucideIcon } from 'lucide-react'
// import { Tooltip, Popup } from 'react-leaflet'
import { toast } from 'sonner'

import { api } from '@workspace/backend/api'
import { Conditional, createContext } from '@workspace/react-utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'

import { DeviceStatusBadge, DeviceStatusDot } from '@/entities/device/components'
import type { Device } from '@/entities/device/types'
import { formatLatLng } from '@/entities/location/lib'
import type { FunctionReturnType } from 'convex/server'
import { MapMarker, MapPopup, MapTooltip } from '@/shared/modules/maps'
import { Point } from 'leaflet'

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

export function DeviceMarker({ device, children }: DeviceMarker.Props) {
  const data = useQuery(api.devices.location.getLast, { deviceId: device._id })

  if (!data) return null

  return (
    <MapMarker
      position={formatLatLng(data.coordinates)}
      icon={
        <IconoGraphicMarker>
          <DeviceIcon device={device} showStatus className="h-4 w-4" />
        </IconoGraphicMarker>
      }
    >
      <Provider value={{ device, data }}>{children}</Provider>
    </MapMarker>
  )
}

export const IconoGraphicMarker = (props: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'relative isolate aspect-square min-w-fit rounded-full bg-background p-1.5 text-foreground',
        // 'outline outline-muted',
        // this is a map marker. let's move it up a bit and add an arrow pointing to the place using tailwind before pseud
        'before:-bottom-3 before:-translate-x-1/2 before:absolute before:left-1/2',
        'before:border-7 before:border-x-transparent before:border-t-background before:border-b-transparent',
        'shadow-xl',
        '-translate-y-3',
        'transition-all',
      )}
    >
      {props.children}
    </div>
  )
}

export const DeviceIcon = ({
  device,
  showStatus = false,
  ...props
}: { device: Device; showStatus?: boolean } & React.ComponentProps<LucideIcon>) => {
  // todo: move to entities/devices DeviceIcon component
  const Icon = device.type === 'desktop' ? MonitorIcon : SmartphoneIcon

  return (
    <>
      <Icon className="h-3 w-3" {...props} />
      <Conditional if={showStatus}>
        <div className="-top-0.5 -right-0.5 absolute z-2 inline-flex rounded-full border-2 border-background bg-background">
          <DeviceStatusDot device={device} className="h-1.5 w-1.5" />
        </div>
      </Conditional>
    </>
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
    <MapTooltip
      interactive
      opacity={1}
      {...props}
      //  className={clsname}
    >
      <SharedContent />
      {/* </Popup> */}
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
