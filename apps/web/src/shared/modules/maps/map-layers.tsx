import { useMemo } from 'react'
import { MapTileLayer } from './map'

type LayerData = React.ComponentProps<typeof MapTileLayer>

export const Layers = {
  mapnik: {
    name: 'Mapnik',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  },
  osm: {
    name: 'Open Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  topographic: {
    name: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    // darkUrl=''
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  worldStreet: {
    name: 'World Street',
    url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS',
  },
} as const satisfies Record<string, LayerData>

export namespace MapTiles {
  export type LayerName = keyof typeof Layers
  export type Props = {
    layers: Array<LayerName>
  }
}

export const MapTiles = (props: MapTiles.Props) => {
  const { layers } = props
  const selected = useMemo(() => {
    return layers.map((name) => Layers[name]).filter(Boolean)
  }, [layers])
  return (
    <>
      {selected.map((layer) => (
        <MapTileLayer key={layer.name} {...layer} />
      ))}
    </>
  )
}

export default Layers
