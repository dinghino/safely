'use client'

import type { ReactNode } from 'react'
import { createContext } from '@workspace/react-utils'
import type { Id } from '@workspace/backend/types'
import { useQueryStates, parseAsArrayOf, parseAsString } from '@workspace/nuqs'
import { parseAsId } from '@/lib/utils'

export namespace PlaceFiltersProvider {
  export type State = {
    /** Currently selected category IDs from URL */
    selectedCategories: Id<'poiCategory'>[]
    /** Update selected categories (updates URL) */
    setSelectedCategories: (ids: Id<'poiCategory'>[] | null) => void
    /** Current search query from URL */
    searchQuery: string
    /** Update search query (updates URL) */
    setSearchQuery: (query: string | null) => void
  }

  export type Props = {
    children: ReactNode
  }
}

const [PlaceFiltersContextProvider, usePlaceFilters] =
  createContext<PlaceFiltersProvider.State>('PlaceFilters')

/**
 * Provider for place filtering state via URL query params (nuqs).
 *
 * Manages:
 * - Category selection (multi-select)
 * - Search query
 *
 * State is persisted in URL, allowing shareable filtered views.
 */
export function PlaceFiltersProvider({ children }: PlaceFiltersProvider.Props) {
  const [{ categories, search }, setFilters] = useQueryStates({
    categories: parseAsArrayOf(parseAsId<Id<'poiCategory'>>()).withDefault([]),
    search: parseAsString.withDefault(''),
  })

  const value: PlaceFiltersProvider.State = {
    selectedCategories: categories,
    setSelectedCategories: (ids) => setFilters({ categories: ids }),
    searchQuery: search,
    setSearchQuery: (query) => setFilters({ search: query }),
  }

  return <PlaceFiltersContextProvider value={value}>{children}</PlaceFiltersContextProvider>
}

export { usePlaceFilters }
