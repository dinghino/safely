import { notFound } from 'next/navigation'
import { fetchQuery } from 'convex/nextjs'

import { api } from '@workspace/backend/api'

import { PlacesMapProvider } from '@/features/place-map'
import { PlaceListWidget, PlaceMapWidget } from '@/widgets/places'

type Props = {
  params: Promise<{ groupSlug: string; categorySlug: string }>
}

export default async function PoiCategoryPage(props: Props) {
  const { categorySlug: slug } = await props.params
  const category = await fetchQuery(api.pois.categories.getBySlug, { slug })

  if (!category) {
    return notFound()
  }

  return (
    <div className="relative isolate h-[512px]">
      <PlacesMapProvider categories={[category._id]}>
        <PlaceMapWidget>{/* <ScrapedCellsLayer /> */}</PlaceMapWidget>
        <PlaceListWidget className="absolute top-4 right-4 z-500 h-fit max-h-[256px] w-72 rounded-lg border bg-card/75 p-4 backdrop-blur-sm" />
      </PlacesMapProvider>
    </div>
  )
}
