import { createContext } from '@workspace/react-utils'
import type { Place } from '../types'

export type PlaceContextType = {
  place: Place
}

export const [PlaceContext, usePlaceContext] = createContext<PlaceContextType>('PlaceContext')

export default { PlaceContext }
