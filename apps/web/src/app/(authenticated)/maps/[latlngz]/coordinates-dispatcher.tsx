'use client'
import { encodeFromMap } from '@/lib/coordinates-encoding'
import { useMapEvents } from 'react-leaflet'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Null map layer that replaces the URI component that contains the map coordinates
 * whenever the map changes position, zoom level, or gets resized.
 * @note The component replaces the current URL with coords with the new location
 */
export function URICoordinatesDispatcher() {
  const pathname = usePathname()
  const router = useRouter()

  const handler = (map: L.Map) => {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const encoded = encodeFromMap({ ...center, zoom })
    const url = pathname.replace(/@[^/]+/, encoded)
    // @ts-expect-error we are replacing an existing URL component with the new coords
    router.replace(url)
  }

  const map = useMapEvents({
    moveend: () => handler(map),
    zoomend: () => handler(map),
    resize: () => handler(map),
  })

  return null
}
