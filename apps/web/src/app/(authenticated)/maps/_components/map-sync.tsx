'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useMap, useMapEvents } from 'react-leaflet'

import {
  decodeFromHash,
  encodeFromMap,
  isValidHash,
  type LatLngZoom,
} from '@/lib/coordinates-encoding'

/**
 * Null map layer that replaces the URI component that contains the map coordinates
 * whenever the map changes position, zoom level, or gets resized.
 * @note The component replaces the current URL with coords with the new location
 * @todo move to a shared library along with `coordinates-encoding`
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

/**
 * Extract the map center and zoom from the URL segment and set the map to that position.
 * This component should be used only once in the whole map route tree, and
 * should be placed as close to the map as possible.
 */
export function InitialPositionSetter() {
  const [navigated, setNavigated] = useState(false)
  const coords = useCoordinatesFromURL()
  const map = useMap()

  useEffect(() => {
    if (!map || !coords || navigated) return
    const { lat, lng, zoom } = coords
    map.setView([lat, lng], zoom)
    setNavigated(true)
  }, [coords, map, navigated])
  return null
}

function useCoordinatesFromURL() {
  const pathname = usePathname()
  const [coords, setCoords] = useState<LatLngZoom | undefined>(undefined)

  useEffect(() => {
    if (coords) return
    const match = pathname.match(/@([^/]+)/)
    if (!match || !isValidHash(match[0])) return
    const decoded = decodeFromHash(match[0])
    setCoords(decoded)
  }, [coords, pathname])

  return coords
}
