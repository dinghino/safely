
/**
 * Module exports functions for encoding and decoding coordinates to sync
 * leaflet map state with URL hash, similar to how google and other platforms
 * operate
 */

type Value = `${number | string}`

export type HashedLatLngZoom = `@${Value},${Value}` | `@${Value},${Value},${number}z`
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
  return `@${lat},${lng},${position.zoom}z` satisfies HashedLatLngZoom
}

export function decodeFromHash(hash: HashedLatLngZoom, defaultZoom = 12): LatLngZoom {
  const decoded = decodeURIComponent(hash)
  if (!decoded.startsWith('@')) return { lat: 0, lng: 0, zoom: 4 }

  const value = decoded.replace('@', '')
  const [lat, lng, z] = value.split(',')
  const zoom = z ? Number(z.replace('z', '')) : defaultZoom
  return { lat: Number(lat), lng: Number(lng), zoom }
}

export function isValidHash(value: unknown): value is HashedLatLngZoom {
  if (typeof value !== 'string') return false
  if (!value.startsWith('@')) return false
  const value_ = value.replace('@', '')
  const [lat, lng, z] = value_.split(',')
  if (!lat || !lng) return false
  if (z && !z.endsWith('z')) return false
  return true
}

/**
 * Calls our convex http endpoint to get the initial location
 * from the device IP
 */
export async function queryInitialLocation() {
  const convexUrl_ = process.env.NEXT_PUBLIC_CONVEX_URL!
  // replace final .cloud with .site for http endpoints
  const convexUrl = convexUrl_.replace('.cloud', '.site')
  const res = await fetch(`${convexUrl}/get-ip-location`)
  return await res.json()
}
