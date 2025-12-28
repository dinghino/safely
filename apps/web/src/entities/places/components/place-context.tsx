import { createContext } from '@workspace/react-utils'
import type { Place } from '../types'

export namespace PlaceProvider {
  export type Value = {
    place: Place
  }

  export type Props = Value & { children: React.ReactNode }
}

export const [PlaceContextProvider, usePlaceContext] =
  createContext<PlaceProvider.Value>('PlaceContext')

/**
 * Generic context provider to share a Place with its children.
 * Used in composing our composable blocks and views.
 */
export const PlaceProvider: React.FC<PlaceProvider.Props> = ({ children, place }) => {
  return <PlaceContextProvider value={{ place }}>{children}</PlaceContextProvider>
}

export default PlaceProvider

export function usePlace() {
  const { place } = usePlaceContext()
  return place
}
