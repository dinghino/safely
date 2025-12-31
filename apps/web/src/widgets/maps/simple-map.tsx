import type { LatLngBounds, LatLngExpression } from 'leaflet'

import { ButtonGroup } from '@workspace/ui/components/button-group'
import { cn } from '@/lib/utils'
import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'

export namespace SimpleMap {
  export type Orientation = 'vertical' | 'horizontal'
  export type Controls = {
    zoom?: boolean
    locate?: boolean
    layers?: boolean
  }
  export type Props = {
    // base react props
    children?: React.ReactNode
    className?: string
    // leaflet specific
    center?: LatLngExpression
    bounds?: LatLngBounds
    // custom props for layers
    layers?: MapTiles.Props['layers']
    defaultLayerGroups?: string[]
    // controls
    controlsOrientation?: Orientation
    controls?: SimpleMap.Controls | false
  }
}

const DEFAULT_ORIENTATION: SimpleMap.Orientation = 'vertical'

/**
 * Simple drop-in map with common controls and tile layers to be used
 * to compose views quickly.
 */
export const SimpleMap = (props: SimpleMap.Props) => {
  const {
    center,
    bounds,
    className,
    controlsOrientation: orientation = DEFAULT_ORIENTATION,
    layers = ['mapnik', 'osm', 'topographic', 'worldStreet'],
    defaultLayerGroups,
    children,
    controls = { zoom: true, locate: true, layers: true },
  } = props
  return (
    <MapContainer center={center} bounds={bounds} className={cn('h-full w-full', className)}>
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={defaultLayerGroups}>
        <MapTileLayer />
        <MapTiles layers={layers} />

        {controls && <Controls orientation={orientation} {...controls} />}

        {children}
      </MapLayers>
    </MapContainer>
  )
}

function Controls(props: SimpleMap.Controls & { orientation: SimpleMap.Orientation }) {
  const { zoom, locate, layers, orientation } = props
  return (
    <ButtonGroup
      orientation={orientation}
      className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
    >
      {zoom && <MapZoomControl orientation={orientation} className="static" />}
      {locate && (
        <ButtonGroup orientation={orientation}>
          <MapLocateControl className="static" />
        </ButtonGroup>
      )}
      {layers && (
        <ButtonGroup orientation={orientation}>
          <MapLayersControl className="static" />
        </ButtonGroup>
      )}
    </ButtonGroup>
  )
}
