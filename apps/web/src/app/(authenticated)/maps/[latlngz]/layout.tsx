import { type HashedLatLngZoom, decodeFromHash } from '@/lib/coordinates-encoding'

import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'
import { URICoordinatesDispatcher } from './coordinates-dispatcher'

export type Props = {
  params: Promise<{ latlngz: HashedLatLngZoom }>
  children: React.ReactNode
}

export default async function CoordinatesLayout(props: Props) {
  const { children } = props
  const { latlngz } = await props.params
  // we need to decode URI params since we expect some @ and commas in there

  const { lat, lng, zoom } = decodeFromHash(latlngz)

  return (
    <div className="relative grid h-full grid-cols-1 grid-rows-[auto_1fr]">
      <div className="z-10 h-fit bg-red-500/10 px-4 py-2">
        header
        {children}
      </div>
      <div className="absolute inset-0 isolate">
        <MapContainer center={[lat, lng]} zoom={zoom} className="h-full w-full">
          <MapLayers defaultTileLayer="Default">
            <MapTileLayer />
            <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />
            {/* {children} */}
          </MapLayers>
          {/* utility layers */}
          <URICoordinatesDispatcher />
        </MapContainer>
      </div>
    </div>
  )
}
