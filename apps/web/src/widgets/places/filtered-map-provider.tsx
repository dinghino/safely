import { PlaceFiltersProvider, usePlaceFilters } from '@/features/place-filters'
import { PlacesMapProvider } from '@/features/place-map'

/**
 * Context wrapper for {@link PlaceFiltersProvider} and {@link PlacesMapProvider}
 * to allow them to communicate with each other and resolve all problems.
 */
export function FilteredMapProvider({ children }: { children: React.ReactNode }) {
  return (
    <PlaceFiltersProvider>
      <WrappedMapProvider>{children}</WrappedMapProvider>
    </PlaceFiltersProvider>
  )
}

const WrappedMapProvider = (props: Omit<PlacesMapProvider.Props, 'categories' | 'searchQuery'>) => {
  const { selectedCategories: categories, searchQuery } = usePlaceFilters()
  return <PlacesMapProvider categories={categories} searchQuery={searchQuery} {...props} />
}
