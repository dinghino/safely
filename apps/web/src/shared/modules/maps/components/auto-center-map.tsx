'use client'
import { formatLatLng } from '@/entities/location/lib'
import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Utility component to center the map on mount (or when location changes) only once.
 * @note this needs to be used inside a MapContainer or LeafletMap component.
 */
export function AutoCenterMap(props: {
  zoom?: number
  coordinates: { latitude: number; longitude: number } | undefined
  repeat?: boolean
}) {
  const { coordinates: location, zoom, repeat } = props
  const map = useMap()
  const [center, setCenter] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!location) return
    if (center || !repeat) return

    const coords = formatLatLng(location)
    setCenter(coords)
    map.setView(coords, zoom ?? 13)
  }, [location, center, map, zoom, repeat])
  return null
}
