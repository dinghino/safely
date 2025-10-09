import type { Locator } from '@workspace/geolocation/types'

// type CoordsObject = Locator.Data | Locator.Data['point']
type CoordsObject = Locator.Data['point']

export function formatLatLng(input: CoordsObject): [number, number] {
  // if (isPoint(input)) {
  return [input.latitude, input.longitude]
  // }
  // return [input.point.latitude, input.point.longitude]
}

// function isPoint(coords: CoordsObject): coords is Locator.Data['point'] {
//   return 'point' in coords
// }
