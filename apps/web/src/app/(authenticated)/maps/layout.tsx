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
import { MapManager } from './map-manager'
import { MapsProviders } from './maps.providers'

type Props = {
  children: React.ReactNode
  toolbar: React.ReactNode
  layers: React.ReactNode
}

export default async function MapsLayout(props: Props) {
  return (
    <MapsProviders>
      <div className="relative isolate h-full max-h-[calc(100vh-var(--header-height))] w-full">
        <_WithResizableMap {...props} />
        {/* <_WithBackgroundMap {...props} /> */}
      </div>
    </MapsProviders>
  )
}

/**
 * Prototype layout with the map contained inside ResizablePanel, so resizing
 * the sidebar also resizes the map
 */
function _WithResizableMap(props: Props) {
  const { children, layers } = props
  return (
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
        <MapComponent layers={layers} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

/**
 * Layout prototype with the map absolutely positioned in the background, not
 * resizing with the overlaying page content
 */
function _WithBackgroundMap(props: Props) {
  const { children, layers } = props
  return (
    <>
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
        <ResizablePanel className="pointer-events-none" />
      </ResizablePanelGroup>

      <section className="-z-10 absolute inset-0 isolate" data-role="map-page-wrapper">
        <MapComponent layers={layers} />
      </section>
    </>
  )
}

function MapComponent({ layers }: { layers: React.ReactNode }) {
  return (
    <MapContainer center={[0, 0]} zoom={4} className="h-full w-full">
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['Places']}>
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
  )
}
