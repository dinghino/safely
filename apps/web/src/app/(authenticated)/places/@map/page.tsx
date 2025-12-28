import { PlacesMapProvider } from '@/features/place-map'
import { PlaceMapWidget } from '@/widgets/places'

export default function MapPage() {
  return (
    <PlacesMapProvider>
      <PlaceMapWidget />
    </PlacesMapProvider>
  )
}
