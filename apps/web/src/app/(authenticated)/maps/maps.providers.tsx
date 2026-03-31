'use client'

import { PlaceFiltersProvider, usePlaceFilters } from '@/features/place-filters'
import { PlacesMapProvider } from '@/features/place-map'

/**
 * Maps segment root providers
 */
export function MapsProviders({ children }: React.PropsWithChildren) {
  return (
    <PlaceFiltersProvider>
      <FilteredMapProvider>{children}</FilteredMapProvider>
    </PlaceFiltersProvider>
  )
}

const FilteredMapProvider = ({ children }: React.PropsWithChildren) => {
  const { selectedCategories: categories, searchQuery } = usePlaceFilters()

  return (
    <PlacesMapProvider categories={categories} searchQuery={searchQuery}>
      {children}
    </PlacesMapProvider>
  )
}
