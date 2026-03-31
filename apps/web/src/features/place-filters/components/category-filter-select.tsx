'use client'

import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'

import type { PoiCategory } from '@workspace/backend/types'

import { GroupedCategoryMultiSelect } from '@/entities/places/category-select'
import { usePlaceFilters } from '../context/place-filters-provider'

export const CategoryFilterSelect = () => {
  const categories = useQuery(api.pois.categories.all)

  return <PlacesCategoryFilterSelect categories={categories ?? []} />
}

export function PlacesCategoryFilterSelect({ categories }: { categories: PoiCategory[] }) {
  const { selectedCategories, setSelectedCategories } = usePlaceFilters()

  return (
    <GroupedCategoryMultiSelect
      categories={categories}
      value={selectedCategories}
      onValueChange={(ids) => setSelectedCategories(ids.length > 0 ? ids : null)}
      placeholder="Filter by category..."
      className="w-full"
      disabled={!categories}
    />
  )
}
