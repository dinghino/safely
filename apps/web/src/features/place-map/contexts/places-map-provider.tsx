'use client'

import { useState, useMemo, type ReactNode } from 'react'

import { createContext } from '@workspace/react-utils'
import type { Id } from '@workspace/backend/dataModel'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

import type { Place } from '@/entities/places/types'
import { usePlacesMapQuery } from '../hooks/use-places-map-query'
import type { MapQueryBounds } from '@workspace/backend/types'
import { useFocusOnPlace } from '../hooks/use-focus-on-place'

const INITIAL_BOUNDS = {
  sw: { lat: 43.84399877553671, lng: 11.06778144836426 },
  ne: { lat: 43.881129336188245, lng: 11.231546401977539 },
}

export namespace PlacesMapProvider {
  export type State = {
    bounds: MapQueryBounds
    setBounds: (bounds: MapQueryBounds) => void
    /** All places currently in the map viewport */
    places: Place[]

    /** Filtered places based on search query */
    filteredPlaces: Place[]
    /** Loading state */
    isLoading: boolean
    /** Focus the map on a specific place, or Deselect if already selected */
    focusOnPlace: (id: Id<'pois'>) => void
    /** forwarded category IDs that are active */
    categories: Id<'poiCategory'>[]

    /** The currently focused place (from URL) */
    focusedPlace: Place | null
  }

  export type Props = {
    children: ReactNode
    categories?: Id<'poiCategory'>[]
    searchQuery?: string
  }
}

const [PlacesMapContextProvider, usePlacesMap] = createContext<PlacesMapProvider.State>('PlacesMap')

// Client-side search filtering
// todo: move server side and/or in
function useFilteredPlaces({ places, search }: { places: Place[]; search: string }) {
  const filteredPlaces = useMemo(() => {
    if (!search) return places
    return places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  }, [places, search])

  return filteredPlaces
}

/**
 * Provider for the places map view.
 * Handles:
 * - Fetching places in current map viewport
 * - Map focus coordination
 * Requires to know (and forward) the categories and search query from some other
 * source to run queries etc.
 * These can be manually provided when creating the component or used in conjunction
 * with {@link PlaceFiltersProvider} to provide the necessary data.
 */
export function PlacesMapProvider(props: PlacesMapProvider.Props) {
  const { children, categories = [], searchQuery: search = '' } = props

  const [bounds, setBounds] = useState(INITIAL_BOUNDS)

  const places = usePlacesMapQuery({ categories, bounds })
  const filteredPlaces = useFilteredPlaces({ places, search })

  // Focus handler
  const { focusedPlaceId, toggleFocusPlaceId } = useFocusOnPlace()

  // Fetch the specific place if we have an ID
  const focusedPlaceQuery = useQuery(
    api.pois.get.one,
    focusedPlaceId ? { id: focusedPlaceId } : 'skip',
  )
  const focusedPlace = focusedPlaceQuery ?? null

  const focusOnPlace = (id: Id<'pois'>) => {
    toggleFocusPlaceId(id)
  }

  const value: PlacesMapProvider.State = {
    bounds,
    setBounds,
    places,
    categories,
    filteredPlaces,
    isLoading: !places || places.length === 0,
    focusOnPlace,
    focusedPlace,
  }

  return <PlacesMapContextProvider value={value}>{children}</PlacesMapContextProvider>
}

export { usePlacesMap }
