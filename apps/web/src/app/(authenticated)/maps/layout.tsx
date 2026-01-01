import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'

import { InitialPositionSetter, URICoordinatesDispatcher } from './_components/map-sync'
import { ButtonGroup } from '@workspace/ui/components/button-group'

type Props = {
  children: React.ReactNode
  toolbar: React.ReactNode
  layers: React.ReactNode
}

export default function MapsLayout(props: Props) {
  const { children, toolbar, layers } = props
  return (
    <div className="relative isolate h-full max-h-[calc(100vh-var(--header-height))] w-full">
      <div className="relative z-10 grid h-full grid-cols-1 grid-rows-[auto_1fr]">
        {toolbar}
        <div className="pointer-events-none h-full w-[200px] max-w-full **:pointer-events-auto p-1">
          {children}
        </div>
        {/* <div className="-z-10 isolate">{map}</div> */}
        <div className="-z-10 absolute inset-0 isolate">
          <MapContainer center={[0, 0]} zoom={4} className="h-full w-full">
            <MapLayers defaultTileLayer="Default">
              <MapTileLayer />
              <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />

              {/* route specific map layers */}
              {layers}

              {/* controls */}
              <ButtonGroup
                orientation="vertical"
                className="absolute right-1 bottom-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
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
            {/* URL utility layers */}
            <URICoordinatesDispatcher />
            <InitialPositionSetter />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
