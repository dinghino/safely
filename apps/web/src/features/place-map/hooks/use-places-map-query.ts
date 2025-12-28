'use client'

import { useEffect, useState } from 'react'
import { useMapEvents } from 'react-leaflet/hooks'
import { useMutation, useQuery } from 'convex/react'

import type { Id, MapQueryBounds } from '@workspace/backend/types'
import { api } from '@workspace/backend/api'

import type { Place } from '@/entities/places/types'
import { leafletMapBoundsToMapQueryBounds } from '@/shared/modules/maps/lib'

type CategoryIds = Id<'poiCategory'>[]

export type UsePlacesMapOptions = {
  categories: CategoryIds
  searchQuery?: string // unused for now, we'll need it later for searching
  bounds: MapQueryBounds
}
export function usePlacesMapQuery(options: UsePlacesMapOptions) {
  const { categories, bounds } = options
  const ensureCoverage = useMutation(api.pois.view.ensureCoverage)

  // useMapCoverage({ categories })
  void ensureCoverage({ bounds, categories })
  return usePlacesInViewport({ categories, bounds })
}

export type UseMapCoverageOptions = {
  categories: CategoryIds
}
/** ensure map places coverage on the backend by triggering scraping */
export function useMapCoverage({ categories }: UseMapCoverageOptions) {
  const ensureCoverage = useMutation(api.pois.view.ensureCoverage)

  // Map event handling
  const map = useMapEvents({
    moveend: () => {
      const bounds = leafletMapBoundsToMapQueryBounds({ map })
      // Trigger background scraping
      void ensureCoverage({ bounds, categories })
    },
  })
}
export type UsePlacesInViewportOptions = {
  categories: CategoryIds
  bounds: MapQueryBounds
}
/**
 * Fetches places in the viewport from the backend.
 * Caches the result to avoid flickering.
 */
export function usePlacesInViewport({ categories, bounds }: UsePlacesInViewportOptions) {
  const data = useQuery(api.pois.get.inView, { categories, bounds })

  // Cache to avoid flickering
  const [cachedPlaces, setCachedPlaces] = useState<Place[]>(data?.pois ?? [])
  useEffect(() => {
    if (data?.pois) {
      setCachedPlaces(data.pois)
    }
  }, [data])

  return cachedPlaces
}
