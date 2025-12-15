'use client'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useQuery } from 'convex/react'

export function usePoiCategoryGroups() {
  return useQuery(api.pois.groups.getAll)
}
export function useCategoryGroupById(id: Id<'poiCategoryGroup'>) {
  return useQuery(api.pois.groups.get, { id })
}
export function useCategoryGroupBySlug(slug: string) {
  return useQuery(api.pois.groups.getBySlug, { slug })
}
// export function usePoiGroupCategories(groupId: Id<'poiCategoryGroup'>) {
//   return usePaginatedQuery(api.pois.categories.getByGroupId, { groupId }, { initialNumItems: 100 })
// }

export function usePoiGroupCategoriesBySlug(slug: string) {
  return useQuery(api.pois.categories.getByGroupSlug, { slug })
}
export function usePoiGroupCategoriesById(groupId: Id<'poiCategoryGroup'>) {
  return useQuery(api.pois.categories.getByGroupId, { groupId })
}
