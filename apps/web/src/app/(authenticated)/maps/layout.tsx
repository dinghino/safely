'use client'

import {
  Map as MapContainer,
  MapTileLayer,
  MapTiles,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapZoomControl,
} from '@/shared/modules/maps'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@workspace/ui/components/resizable'
import { InitialPositionSetter, MapResizeObserver } from '@/shared/modules/maps/components'
import { PlacesMapProvider } from '@/features/place-map'
import { MapManager } from './map-manager'

type Props = {
  children: React.ReactNode
  toolbar: React.ReactNode
  layers: React.ReactNode
}

export default function MapsLayout(props: Props) {
  const { children, toolbar: _toolbar, layers } = props

  return (
    <PlacesMapProvider categories={[]}>
      <div className="relative isolate h-full max-h-[calc(100vh-var(--header-height))] w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel
            className="pointer-events-auto min-w-[256px] overflow-y-hidden"
            minSize={15}
            defaultSize={25}
            maxSize={50}
          >
            {children}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="relative isolate">
            <MapContainer center={[0, 0]} zoom={4} className="h-full w-full">
              <MapLayers defaultTileLayer="Default" defaultLayerGroups={['places']}>
                <MapTileLayer />
                <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />

                {layers}

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

              <MapResizeObserver />
              <MapManager />
              <InitialPositionSetter />
            </MapContainer>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* <div className="pointer-events-none relative isolate z-10 grid h-full w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden">
          <section>
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

              {layers}

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
            <MapManager />
            <InitialPositionSetter />
          </MapContainer>
        </section> */}
      </div>
    </PlacesMapProvider>
  )
}
