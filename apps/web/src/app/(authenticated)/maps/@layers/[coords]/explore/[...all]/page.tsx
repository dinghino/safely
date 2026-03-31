import { PlacesMapLayer } from '@/features/place-map/components'

/**
 * Catch-all dynamic segment for the explore places routes, showing all markers
 * in the map.
 */
export default function CatchAllMapLayers() {
  return <PlacesMapLayer name="Places" />
}
