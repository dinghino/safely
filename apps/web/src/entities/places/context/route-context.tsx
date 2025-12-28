'use client'

import { useParams } from 'next/navigation'
import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import type { CategoryItem, CategoryGroup } from '../types'

type PlacesRouteParams = {
  groupSlug?: string
  categorySlug?: string
  placeSlug?: string
}

type PlacesRouteContextValue = PlacesRouteParams & {
  group?: CategoryGroup | null
  category?: CategoryItem | null
  isLoading: boolean
  setSlugs: (slugs: Partial<PlacesRouteParams>) => void
}

const PlacesRouteContext = createContext<PlacesRouteContextValue>({
  isLoading: false,
  setSlugs: () => {},
})

export function PlacesRouteProvider({ children }: { children: React.ReactNode }) {
  const urlParams = useParams() as PlacesRouteParams
  const [dispatchedParams, setDispatchedParams] = useState<Partial<PlacesRouteParams>>({})

  // Merge dispatched params with URL params (URL params take precedence or vice-versa?
  // User wants dispatch to work, so let's merge)
  const params = useMemo(
    () => ({
      groupSlug: urlParams.groupSlug || dispatchedParams.groupSlug,
      categorySlug: urlParams.categorySlug || dispatchedParams.categorySlug,
      placeSlug: urlParams.placeSlug || dispatchedParams.placeSlug,
    }),
    [urlParams, dispatchedParams],
  )

  const setSlugs = useCallback((slugs: Partial<PlacesRouteParams>) => {
    setDispatchedParams((prev) => ({ ...prev, ...slugs }))
  }, [])

  const group = useQuery(
    api.pois.groups.getBySlug,
    params.groupSlug ? { slug: params.groupSlug } : 'skip',
  )
  const category = useQuery(
    api.pois.categories.getBySlug,
    params.categorySlug ? { slug: params.categorySlug } : 'skip',
  )

  const value = useMemo(
    () => ({
      ...params,
      group,
      category,
      isLoading: (!!params.groupSlug && !group) || (!!params.categorySlug && !category),
      setSlugs,
    }),
    [params, group, category, setSlugs],
  )

  return <PlacesRouteContext.Provider value={value}>{children}</PlacesRouteContext.Provider>
}

export const usePlacesRoute = () => useContext(PlacesRouteContext)
