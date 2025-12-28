'use client'

import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

import type { PoiCategory } from '@workspace/backend/types'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

import { GroupedCategoryMultiSelect } from '@/entities/places/category-select'
import { usePlaceFilters } from '../context/place-filters-provider'

/**
 * Composed filter component for places.
 *
 * It provides:
 * - Category filter
 * - Name search filter
 *
 * @note this can be technically removed and composed at the consuming level above
 */
export const PlaceFiltersFacade = () => {
  const categories = useQuery(api.pois.categories.all)

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:flex-row">
      <div className="flex-1 space-y-1.5">
        <Label
          htmlFor="category-filter"
          className="px-1 text-muted-foreground text-xs uppercase tracking-wider"
        >
          Categories
        </Label>
        <PlacesCategoryFilterSelect categories={categories ?? []} />
      </div>

      <div className="flex-1 space-y-1.5">
        <Label
          htmlFor="search-filter"
          className="px-1 text-muted-foreground text-xs uppercase tracking-wider"
        >
          Search
        </Label>
        <PlacesNameSearchFilter />
      </div>
    </div>
  )
}

export function PlacesCategoryFilterSelect({ categories }: { categories: PoiCategory[] }) {
  const { selectedCategories, setSelectedCategories } = usePlaceFilters()

  return (
    <GroupedCategoryMultiSelect
      categories={categories ?? []}
      value={selectedCategories}
      onValueChange={(ids) => setSelectedCategories(ids.length > 0 ? ids : null)}
      placeholder="Filter by category..."
      className="w-full"
      disabled={!categories}
    />
  )
}

export function PlacesNameSearchFilter() {
  const { searchQuery, setSearchQuery } = usePlaceFilters()

  return (
    <Input
      id="search-filter"
      placeholder="Search places by name..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value || null)}
      className="w-full"
    />
  )
}
