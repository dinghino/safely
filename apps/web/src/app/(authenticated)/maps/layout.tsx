import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
  MapManager,
} from '@/shared/modules/maps'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import { InitialPositionSetter } from '@/shared/modules/maps/components'
import { PlacesMapProvider } from '@/features/place-map'

type Props = {
  children: React.ReactNode
  toolbar: React.ReactNode
  layers: React.ReactNode
}

export default function MapsLayout(props: Props) {
  const { children, toolbar, layers } = props
  return (
    <PlacesMapProvider categories={[]}>
      <div className="relative isolate h-full max-h-[calc(100vh-var(--header-height))] w-full">

        <div className="pointer-events-none relative isolate z-10 grid h-full w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden">
          <section className="pointer-events-auto row-span-full overflow-y-hidden">
            {children}
          </section>
          <div className="pointer-events-auto row-start-1">
            {toolbar}
          </div>
        </div>

        <section className="-z-10 absolute inset-0 isolate" data-role="map-page-wrapper">
          <MapContainer center={[0, 0]} zoom={4} className="h-full w-full">
            <MapLayers defaultTileLayer="Default" defaultLayerGroups={['places']}>
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
            <MapManager />
            <InitialPositionSetter />
          </MapContainer>
        </section>
      </div>
    </PlacesMapProvider>
  )
}
