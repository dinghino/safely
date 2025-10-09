'use client'

import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

import { ButtonGroup } from '@workspace/ui/components/button-group'

import { cn } from '@/lib/utils'

import { LeafletMap, ZoomControls } from '@/shared/modules/maps'
import { CenterMapButton, DeviceMarker, DeviceTooltip, UserLocation } from '@/widgets/maps'
import { useMemo } from 'react'
import { useDeviceContext } from '@/features/device-manager'
import { FeatureGroup, LayersControl } from 'react-leaflet'

export const LastKnownLocationMap = () => {
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
      <LayersControl position="topright" collapsed={false}>
        <LayersControl.Overlay name="My Devices" checked>
          <UserDevicesLayer includeCurrent />
        </LayersControl.Overlay>
      </LayersControl>
    </LeafletMap>
  )
}

export namespace UserDevicesLayer {
  export type Props = {
    includeCurrent?: boolean
  }
}

function UserDevicesLayer(props: UserDevicesLayer.Props) {
  const { includeCurrent = false } = props
  const devices = useQuery(api.devices.get.all)
  const { device } = useDeviceContext()

  const items = useMemo(() => {
    if (!devices) return []
    if (includeCurrent) return devices
    return devices.filter((d) => d._id !== device?._id)
  }, [devices, includeCurrent, device?._id])

  return (
    <FeatureGroup>
      {items?.map((device) => (
        <DeviceMarker key={device._id} device={device}>
          <DeviceTooltip sticky direction="top" />
        </DeviceMarker>
      ))}
    </FeatureGroup>
  )
}
