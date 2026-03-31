import type { MapQueryBounds } from '@workspace/backend/types'
export type TransformBoundsOptions =
  | {
      bounds: L.LatLngBounds
    }
  | { map: L.Map }

function getBounds(options: TransformBoundsOptions): L.LatLngBounds {
  if ('map' in options) {
    return options.map.getBounds()
  }
  return options.bounds
}

export function leafletMapBoundsToMapQueryBounds(options: TransformBoundsOptions): MapQueryBounds {
  const bounds = getBounds(options)
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return { sw, ne }
}
