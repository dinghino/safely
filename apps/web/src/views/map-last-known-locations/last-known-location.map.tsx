'use client'

import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

// import { cn } from '@/lib/utils'

import { DeviceMarker, DevicePopup } from '@/widgets/maps'
import { useMemo } from 'react'
import { useDeviceContext } from '@/features/device-manager'
import {
  Map as LeafletMap,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapTileLayer,
  MapZoomControl,
} from '@/shared/modules/maps'
import { MapTiles } from '@/shared/modules/maps/map-layers'
import { ButtonGroup } from '@workspace/ui/components/button-group'

const CENTER = [43.85857, 11.1422382] as [number, number]

const ORIENTATION: 'vertical' | 'horizontal' = 'vertical'

export const LastKnownLocationMap = () => {
  return (
    <LeafletMap center={CENTER} className="h-full w-full bg-background" scrollWheelZoom>
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['devices']}>
        <MapTileLayer />
        <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />
        <UserDevicesLayer name="devices" />

        <ButtonGroup
          orientation={ORIENTATION}
          className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
        >
          <MapZoomControl orientation={ORIENTATION} className="static" />
          <ButtonGroup orientation={ORIENTATION}>
            <MapLocateControl className="static" />
          </ButtonGroup>
          <ButtonGroup orientation={ORIENTATION}>
            <MapLayersControl className="static" />
          </ButtonGroup>
        </ButtonGroup>
      </MapLayers>
    </LeafletMap>
  )
}

export namespace UserDevicesLayer {
  export type Props = {
    includeCurrent?: boolean
    name: string
  }
}

function UserDevicesLayer(props: UserDevicesLayer.Props) {
  const { name, includeCurrent = false } = props
  const devices = useQuery(api.devices.get.all)
  const { device } = useDeviceContext()

  const items = useMemo(() => {
    if (!devices) return []
    if (includeCurrent) return devices
    return devices.filter((d) => d._id !== device?._id)
  }, [devices, includeCurrent, device?._id])

  return (
    <MapLayerGroup name={name} eventHandlers={{ click: (e) => console.log(e) }}>
      {items?.map((device) => (
        <DeviceMarker key={device._id} device={device}>
          <DevicePopup />
        </DeviceMarker>
      ))}
    </MapLayerGroup>
  )
}
