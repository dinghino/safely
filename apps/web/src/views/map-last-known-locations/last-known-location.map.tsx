'use client'

import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

import { ButtonGroup } from '@workspace/ui/components/button-group'

import { cn } from '@/lib/utils'

import { LeafletMap, ZoomControls } from '@/shared/modules/maps'
import { CenterMapButton, DeviceMarker, DeviceTooltip, UserLocation } from '@/widgets/maps'

export const LastKnownLocationMap = () => {
  const devices = useQuery(api.devices.get.all)

  return (
    <LeafletMap className="h-full w-full bg-background" scrollWheelZoom zoomControl={false}>
      <div className={cn('leaflet-top leaflet-top pl-2')}>
        <ButtonGroup orientation="vertical">
          <ZoomControls orientation="vertical" variant="default" />
          <ButtonGroup orientation="vertical">
            <CenterMapButton autoCenter />
          </ButtonGroup>
        </ButtonGroup>
      </div>
      <UserLocation />
      {devices?.map((device) => (
        <DeviceMarker key={device._id} device={device}>
          <DeviceTooltip />
        </DeviceMarker>
      ))}
    </LeafletMap>
  )
}
