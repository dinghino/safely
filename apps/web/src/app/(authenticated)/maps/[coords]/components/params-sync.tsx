'use client'

import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { usePlacesMap } from '@/features/place-map'
import type { CategoryGroup, CategoryItem } from '@/entities/places/types'
import type { Id } from '@workspace/backend/dataModel'

export namespace ParamsSync {
  export type Props = {
    data: Map<CategoryGroup, CategoryItem[]>
    /** dynamic segment parameter name to map for the catchall */
    segment?: string
  }
}

/**
 * Syncs the URL params (group, category) with the PlacesMap context.
 * This allows the map to react to route changes and filter content accordingly.
 */
export function ParamsSync({ data, segment = 'all' }: ParamsSync.Props) {
  const { setCategories } = usePlacesMap()
  const params = useParams()

  // Extract slugs from the catch-all dynamic route [...all]
  // Expected formats:
  // /explore -> []
  // /explore/group -> [groupSlug]
  // /explore/group/category -> [groupSlug, categorySlug]
  // or flat /explore/category if unique? Assuming strict hierarchy or flat fallback
  const slugs = (params?.[segment] as string[]) || []

  // Naive interpretation: 
  // If 1 param -> check if group, else check if category
  // If 2 params -> assume group/category
  // This logic must match how we build breadcrumbs/routes

  const categoryIds = useMemo(() => {
    const activeIds: Id<'poiCategory'>[] = []

    // Helper to find category by slug (slow but safe for small sets)
    const findCategory = (slug: string) => {
      for (const [group, categories] of data.entries()) {
        const found = categories.find(c => c.slug === slug)
        if (found) return found
      }
      return null
    }

    const findGroup = (slug: string) => {
      for (const [group] of data.entries()) {
        if (group.slug === slug) return group
      }
      return null
    }

    if (slugs.length === 0) {
      // No filter = show all? or show none?
      // Usually "explore" implies showing everything or defaults
      return []
    }

    const [first, second] = slugs

    // Check strict group/category first
    if (second) {
      // likely group/category
      const cat = findCategory(second)
      if (cat) activeIds.push(cat._id)
    } else if (first) {
      // is it a group?
      const group = findGroup(first)
      if (group) {
        const groupCategories = data.get(group) || []
        activeIds.push(...groupCategories.map(c => c._id))
      } else {
        // maybe a direct category link?
        const cat = findCategory(first)
        if (cat) activeIds.push(cat._id)
      }
    }

    return activeIds
  }, [data, slugs])

  useEffect(() => {
    // Only update if we have meaningful change?
    // setCategories checks internally or React state does
    setCategories(categoryIds)
  }, [categoryIds, setCategories])

  return null
}
