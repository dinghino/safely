
/**
 * Module exports functions for encoding and decoding coordinates to sync
 * leaflet map state with URL hash, similar to how google and other platforms
 * operate
 */

type Value = `${number | string}`

export type HashedLatLngZoom = `@${Value},${Value}` | `@${Value},${Value},z${number}`
export type LatLngZoom = {
  lat: number
  lng: number
  zoom: number
}

type EncoderPosition = { lat: number, lng: number, zoom?: number }
type EncoderOptions = {
  precision?: number
}

export function encodeFromMap(position: EncoderPosition, opts?: EncoderOptions): HashedLatLngZoom {
  const { precision = 6 } = opts || {}
  const lat = position.lat.toFixed(precision)
  const lng = position.lng.toFixed(precision)
  if (!position.zoom) return `@${lat},${lng}`
  return `@${lat},${lng},z${position.zoom}`
}

export function decodeFromHash(hash: HashedLatLngZoom, defaultZoom = 12): LatLngZoom {
  const decoded = decodeURIComponent(hash)
  if (!decoded.startsWith('@')) return { lat: 0, lng: 0, zoom: 4 }

  const value = decoded.replace('@', '')
  const [lat, lng, z] = value.split(',')
  const zoom = z ? Number(z.replace('z', '')) : defaultZoom
  return { lat: Number(lat), lng: Number(lng), zoom }
}
