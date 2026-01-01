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

type Props = {
  children: React.ReactNode
  toolbar: React.ReactNode
}

export default function MapsLayout(props: Props) {
  const { children, toolbar } = props
  return (
    <div className="relative isolate h-full max-h-[calc(100vh-var(--header-height))] w-full">
      <div className="relative z-10 grid h-full grid-cols-1 grid-rows-[auto_1fr]">
        {toolbar}
        <div className="h-full w-[200px] max-w-full">{children}</div>
        {/* <div className="-z-10 isolate">{map}</div> */}
        <div className="-z-10 absolute inset-0 isolate">
          <MapContainer center={[0, 0]} zoom={4} className="h-full w-full">
            <MapLayers defaultTileLayer="Default">
              <MapTileLayer />
              <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />
              {/* {children} */}
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
