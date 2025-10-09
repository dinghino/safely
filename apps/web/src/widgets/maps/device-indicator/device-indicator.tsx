'use client'
import { useQuery } from 'convex/react'
import { MonitorIcon, SmartphoneIcon, type LucideIcon } from 'lucide-react'
import { Circle, Tooltip, Popup } from 'react-leaflet'
import { toast } from 'sonner'

import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'

import { DeviceStatusBadge } from '@/entities/device/components'
import type { Device } from '@/entities/device/types'
import { formatLatLng } from '@/entities/location/lib'
import type { FunctionReturnType } from 'convex/server'

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

  // const popoupTip = cn('[&_.leaflet-popup-tip-container]:!bg-card [&_.leaflet-popup-tip]:!border-muted')
  return (
    <Circle center={formatLatLng(data.coordinates)} radius={2} color="red" interactive>
      <Provider value={{ device, data }}>{children}</Provider>
    </Circle>
  )
}

export const DeviceIcon = ({
  device,
  ...props
}: { device: Device } & React.ComponentProps<LucideIcon>) => {
  // todo: move to entities/devices DeviceIcon component
  const Icon = device.type === 'desktop' ? MonitorIcon : SmartphoneIcon
  return <Icon {...props} />
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
      <Button
        size="sm"
        onClick={() => {
          toast.info(`Clicked on device ${device.name}`)
        }}
      >
        Learn more
      </Button>
    </div>
  )
}

export function DeviceTooltip() {
  const clsname = cn(
    '!bg-card !border-0 !shadow-xl !text-foreground !border-muted',
    '!rounded-xl',
    // pointing arrow color overrides
    '!before:border-r-muted !before:border-l-muted',
    '!before:border-t-muted !before:border-b-muted',
  )
  return (
    <Tooltip interactive permanent opacity={1} className={clsname}>
      <SharedContent />
      {/* </Popup> */}
    </Tooltip>
  )
}

export function DevicePopup() {
  const clsname = cn(
    '!bg-card !border-0 !shadow-xl !text-foreground !border-muted',
    '!rounded-xl',
    // pointing arrow color overrides
    '!before:border-r-muted !before:border-l-muted',
    '!before:border-t-muted !before:border-b-muted',
  )
  return (
    <Popup autoPan className={clsname}>
      <SharedContent />
    </Popup>
  )
}
