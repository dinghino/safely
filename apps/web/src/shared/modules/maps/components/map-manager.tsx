'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMapEvents } from 'react-leaflet/hooks'

import { usePlacesMap } from '@/features/place-map'
import { leafletMapBoundsToMapQueryBounds } from '@/shared/modules/maps/lib'
import { encodeFromMap } from '@/lib/coordinates-encoding'

/**
 * Manages the synchronization between the Map interactions (Leaflet),
 * the Application State (PlacesMapProvider), and the URL.
 *
 * Responsibilities:
 * 1. Listens to map 'moveend' events.
 * 2. Updates the `PlacesMapProvider` bounds state to trigger data fetching.
 * 3. Updates the URL with the current map center and zoom (@lat,lng,z) to support deep linking and sharing.
 */
export function MapManager() {
  const { setBounds } = usePlacesMap()
  const pathname = usePathname()
  const router = useRouter()

  const map = useMapEvents({
    moveend: () => {
      // 1. Update Provider State (for data fetching)
      const bounds = leafletMapBoundsToMapQueryBounds({ map })
      setBounds(bounds)

      // 2. Update URL (for shareability/history)
      const center = map.getCenter()
      const zoom = map.getZoom()
      const encoded = encodeFromMap({ ...center, zoom })

      // If we are already on a map route with coords, replace them
      // otherwise this might be an initial load or different route structure, so be careful
      if (pathname.includes('@')) {
        const url = pathname.replace(/@[^/]+/, encoded)
        router.replace(url as any)
      }
    }
  })

  // Initial bounds sync on mount (if needed, though map usually fires moveend/load)
  useEffect(() => {
    if (map) {
      const bounds = leafletMapBoundsToMapQueryBounds({ map })
      setBounds(bounds)
    }
  }, [map, setBounds])

  return null
}
