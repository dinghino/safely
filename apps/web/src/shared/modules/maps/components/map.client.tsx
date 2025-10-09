'use client'

import { useTheme } from '@workspace/ui/providers/theme-provider'
import 'leaflet/dist/leaflet.css'
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'
// import 'leaflet-defaulticon-compatibility'

import { MapContainer, TileLayer } from 'react-leaflet'

export namespace MapsLeaflet {
  export type Props = React.ComponentProps<typeof MapContainer>
}
/**
 * Base map component that wraps the MapContainer from react-leaflet
 * with some default overridable values.
 *
 * This is lazy loaded in the map.tsx file to avoid SSR issues.
 * @use LeafletMap from `./map.tsx` instead of this directly for lazy loading the component
 *      and resolve all the webpack issues with leaflet.
 *
 * Tiles
 * ---
 * Tile layers come from
 * - https://leaflet-extras.github.io/leaflet-providers/preview/
 * - https://alexurquhart.github.io/free-tiles/
 */
export function BaseMap({ children, ...props }: MapsLeaflet.Props) {

  return (
    <MapContainer
      center={props.center ?? [51.505, -0.09]}
      zoom={12}
      minZoom={5}
      maxZoom={18}
      {...props}
    >
      <BaseLayer />
      {children}
    </MapContainer>
  )
}

export default BaseMap

/**
 * Dynamic base tiles layer that changes based on the current theme
 * @todo: expand with more themes and options from user preferences
 */
const BaseLayer = () => {
  const { theme, resolvedTheme } = useTheme()

  const isDark = theme === 'dark' || resolvedTheme === 'dark'

  if (isDark) {
    return (
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png"
        url="http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
      />
    )
  }

  return (
    <TileLayer
      // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png"
      url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
    />
  )
}
