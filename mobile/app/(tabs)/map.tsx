import {
  Camera,
  MapView,
  MarkerView,
  RasterLayer,
  RasterSource,
} from '@maplibre/maplibre-react-native'
import { useEffect, useId, useMemo } from 'react'
import { LogBox, View } from 'react-native'

import { useGeolocation } from '@/components/contexts/geolocation'
import { cn } from '@/lib/utils'
import BackgroundGeolocation, { type Location } from 'react-native-background-geolocation'

// Using Esri World Street Map - no subdomains needed
// const tileUrl =
//   // 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
//   // 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
//   'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'

const cartoCdn = {
  dark: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  light: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  voyager: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
}

export default function MapScreen() {
  const { locations, lastLocation: current } = useGeolocation()

  // Suppress MapLibre warnings
  useEffect(() => {
    LogBox.ignoreLogs(['MapLibre', 'Request failed due to a permanent error', 'Mbgl-HttpRequest'])
  }, [])

  useEffect(() => {
    // request current position on mount
    BackgroundGeolocation.getCurrentPosition({
      maximumAge: 5_000,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      timeout: 15_000,
    })
  }, [])

  const rest = useMemo(() => {
    if (locations.length <= 1) return []
    return locations.slice(0, -1)
  }, [locations])

  const rasterId = useId()
  const lastId = useId()

  return (
    <MapView style={{ flex: 1 }} logoEnabled attributionEnabled rotateEnabled={false}>
      {/* Custom Raster Tile Source */}
      <RasterSource id={rasterId} tileUrlTemplates={[cartoCdn.dark]} tileSize={128}>
        <RasterLayer id={`${rasterId}-layer`} sourceID={rasterId} />
      </RasterSource>

      {current && (
        <>
          <Camera centerCoordinate={formatCoordinates(current)} zoomLevel={14} />
          <MarkerView id={lastId} coordinate={formatCoordinates(current)}>
            <View
              className={cn('h-5 w-5 rounded-full border-2 border-white bg-red-500 shadow-lg')}
            />
          </MarkerView>
        </>
      )}
      {rest.map((loc, index) => (
        <MarkerView key={index} coordinate={[loc.coords.longitude, loc.coords.latitude]}>
          <View className={cn('h-2.5 w-2.5 rounded-full border border-white bg-blue-500')} />
        </MarkerView>
      ))}
    </MapView>
  )
}
type Vec2 = [number, number]
type Vec3 = [number, number, (number | undefined)?]
function formatCoordinates(data: Location): Vec2 {
  const { coords } = data
  return [coords.longitude, coords.latitude]
}
function withAltitude(data: Location): Vec3 {
  const { coords } = data
  return [...formatCoordinates(data), coords.altitude]
}
/**
 last location style
  backgroundColor: 'red',
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: 'white',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,

 rest location style
  backgroundColor: 'blue',
  width: 10,
  height: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'white',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
 */
