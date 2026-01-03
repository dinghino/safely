'use client'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useQuery } from 'convex/react'

// region get all

/**
 * Get all POI categories
 */
export function usePoiCategories() {
  return useQuery(api.pois.categories.all)
}
/**
 * Get all POI category groups
 */
export function usePoiCategoryGroups() {
  return useQuery(api.pois.groups.getAll)
}

// region get category group

export function useCategoryGroupById(id: Id<'poiCategoryGroup'>) {
  return useQuery(api.pois.groups.get, { id })
}
export function useCategoryGroupBySlug(slug: string | undefined) {
  return useQuery(api.pois.groups.getBySlug, { slug: slug ?? 'skip' })
}
// export function usePoiGroupCategories(groupId: Id<'poiCategoryGroup'>) {
//   return usePaginatedQuery(api.pois.categories.getByGroupId, { groupId }, { initialNumItems: 100 })
// }

// region get categories

export function usePoiGroupCategoriesBySlug(slug: string) {
  return useQuery(api.pois.categories.getByGroupSlug, { slug })
}
export function usePoiGroupCategoriesById(groupId: Id<'poiCategoryGroup'>) {
  return useQuery(api.pois.categories.getByGroupId, { groupId })
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery(api.pois.categories.getBySlug, { slug: slug ?? 'skip' })
}
