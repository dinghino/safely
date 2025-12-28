'use client'

import type { Id } from '@workspace/backend/dataModel'
import { PlacesMapProvider } from '@/features/place-map'
import { PlaceMapWidget } from '@/widgets/places'
import { PlacesBreadcrumbs } from './places-breadcrumbs'

export namespace PlacesMapHeader {
  export type Props = {
    categoryIds?: Id<'poiCategory'>[]
    breadcrumbs?: PlacesBreadcrumbs.Props
    children?: React.ReactNode
  }
}

/**
 * Standardized header layout for the Places section.
 * Renders the Map Widget in a fixed container and Breadcrumbs below it.
 */
export function PlacesMapHeader(props: PlacesMapHeader.Props) {
  const { categoryIds, breadcrumbs } = props

  return (
    <>
      <div className="h-[384px] w-full overflow-hidden">
        <PlacesMapProvider categories={categoryIds}>
          <PlaceMapWidget />
        </PlacesMapProvider>
      </div>
      <div className="content-grid">
        <PlacesBreadcrumbs {...breadcrumbs} />
      </div>
    </>
  )
}
