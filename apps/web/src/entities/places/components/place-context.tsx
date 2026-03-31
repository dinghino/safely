'use client'

import { createContext } from '@workspace/react-utils'
import type { Place } from '../types'

export const [PlaceContextProvider, usePlaceContext] =
  createContext<PlaceProvider.Value>('PlaceContext')

export namespace PlaceProvider {
  export type Value = {
    place: Place
  }

  export type Props = Value & { children: React.ReactNode }
}

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

/**
 * HoC factory that creates a context-aware version of a Place component.
 * The resulting component automatically injects `place` from PlaceProvider.
 *
 * @template TPlaceShape - The specific shape of Place data required by the component
 * @template TProps - The full prop type including the place prop
 */
export function createPlaceContextConsumer<
  TPlaceShape extends Partial<Place>,
  TProps extends { place: TPlaceShape },
>(Component: React.ComponentType<TProps>): React.ComponentType<Omit<TProps, 'place'>> {
  const SmartComponent = (props: Omit<TProps, 'place'>) => {
    const place = usePlace()
    // TypeScript will enforce that `place` from context satisfies TPlaceShape
    return <Component {...(props as TProps)} place={place as TPlaceShape} />
  }

  SmartComponent.displayName = `PlaceContext(${Component.displayName || Component.name})`

  return SmartComponent
}
