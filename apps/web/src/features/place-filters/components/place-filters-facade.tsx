'use client'

import { Label } from '@workspace/ui/components/label'

import { PlacesNameSearchFilter } from './places-search'
import { CategoryFilterSelect } from './category-filter-select'

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
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:flex-row">
      <div className="flex-1 space-y-1.5">
        <Label
          htmlFor="category-filter"
          className="px-1 text-muted-foreground text-xs uppercase tracking-wider"
        >
          Categories
        </Label>
        <CategoryFilterSelect />
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
