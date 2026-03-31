'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { useMap } from 'react-leaflet'

import {
  decodeFromHash,
  isValidHash,
  type LatLngZoom,
} from '@/lib/coordinates-encoding'

/**
 * Null map layer that replaces the URI component that contains the map coordinates
 * whenever the map changes position, zoom level, or gets resized.
 * @note The component replaces the current URL with coords with the new location
 * @todo move to a shared library along with `coordinates-encoding`
 */


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
