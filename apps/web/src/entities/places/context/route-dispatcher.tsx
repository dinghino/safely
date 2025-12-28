'use client'

import { useEffect } from 'react'
import { usePlacesRoute } from './route-context'

export namespace PlacesRouteDispatcher {
  export type Props = {
    groupSlug?: string
    categorySlug?: string
    placeSlug?: string
  }
}

/**
 * Helper component to dispatch slugs to the PlacesRouteContext.
 * Place this in server-side pages to communicate the current route to the layout/map.
 */
export function PlacesRouteDispatcher(props: PlacesRouteDispatcher.Props) {
  const { groupSlug, categorySlug, placeSlug } = props
  const { setSlugs } = usePlacesRoute()

  useEffect(() => {
    setSlugs({ groupSlug, categorySlug, placeSlug })
  }, [groupSlug, categorySlug, placeSlug, setSlugs])

  return null
}
