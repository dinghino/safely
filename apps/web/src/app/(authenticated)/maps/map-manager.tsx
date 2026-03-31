'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMapEvents } from 'react-leaflet/hooks'

import { usePlacesMap } from '@/features/place-map'
import { leafletMapBoundsToMapQueryBounds } from '@/shared/modules/maps/lib'
import { encodeFromMap } from '@/lib/coordinates-encoding'

/**
 * Manages the synchronization between the Map interactions (Leaflet),
 * the Application State (PlacesMapProvider), and the URL.
 *
 * Responsibilities:
 * 1. Listens to map events.
 * 2. Updates the `PlacesMapProvider` bounds state to trigger data fetching.
 * 3. Updates the URL with the current map center and zoom (@lat,lng,z) to support deep linking and sharing.
 */
export function MapManager() {
  const { setBounds } = usePlacesMap()
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()

  const handler = () => {
    // This assumes that we have our `@lat,lng,z` in the URL and is going to
    // target that.
    if (!pathname.includes('@')) return

    // Update Provider State (for data fetching)
    const bounds = leafletMapBoundsToMapQueryBounds({ map })
    setBounds(bounds)

    // Get values and encode them for our URI
    const center = map.getCenter()
    const zoom = map.getZoom()
    const encoded = encodeFromMap({ ...center, zoom })
    const newPath = pathname.replace(/@[^/]+/, encoded)
    const searchParams = new URLSearchParams(search).toString()
    const url = searchParams ? `${newPath}?${searchParams}` : newPath

    // @ts-expect-error next expects strictly typed, we can't provide that.
    router.replace(url, { scroll: false })
  }
  const map = useMapEvents({
    moveend: handler,
    zoomend: handler,
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
