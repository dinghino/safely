'use client'

import type { CategoryGroup, CategoryItem } from '@/entities/places/types'
import { PlacesMapProvider } from '@/features/place-map'
import { createContext } from '@workspace/react-utils'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

export namespace ParamsContext {
  export type Value = {
    group?: string
    category?: string
  }
  export type Props = {
    children: React.ReactNode
    data: Map<CategoryGroup, CategoryItem[]>
  }
  export type Params = {
    group?: string
    category?: string
    all?: string[]
  }
}

const [ParamsContextProvider, useParamsContext] = createContext<ParamsContext.Value>()

export { useParamsContext }

/**
 * Thin wrapper for the whole explore section that takes in the route parameters
 * and sets up all the contexts needed to handle querying our backend from all
 * the page(s) internal to the section.
 *
 * @note this provider is set up to work directly with the explore layout that
 * is meant to fetch all categories server side and pass them down. this is because
 * in the end groups and categories are somewhat static and we don't need real
 * time updates on their values.
 *
 * If we ever end up needing real time we need to split a few parts of the
 * explore section into client components and have them access this provider.
 */
export function ExploreSectionProvider(props: ParamsContext.Props) {
  const { data, children } = props
  const { group, category } = useParams<ParamsContext.Params>()
  console.log('params provider', { group, category })

  const categories = useMemo(() => {
    if (category) {
      // having a category slug takes precedence on everything and we only want that
      const all = [...data.values()].flat()
      return all.filter((c) => c.slug === category).map((c) => c._id)
    }
    if (group) {
      // having a group means we want all categories of that group
      const groupData = [...data.keys()].find((g) => g.slug === group)
      if (!groupData) return []
      return data.get(groupData)?.map((c) => c._id) || []
    }
    // if we don't have either we want all categories, which means empty array
    return []
  }, [data, group, category])

  return (
    <ParamsContextProvider value={{ group, category }}>
      <PlacesMapProvider categories={categories}>{children}</PlacesMapProvider>
    </ParamsContextProvider>
  )
}
