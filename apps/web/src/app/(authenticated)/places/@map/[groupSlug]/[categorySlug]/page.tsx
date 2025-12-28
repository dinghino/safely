import { notFound } from 'next/navigation'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'
import { PlacesMapProvider } from '@/features/place-map'
import { PlaceMapWidget } from '@/widgets/places'

type Props = {
  params: Promise<{ groupSlug: string; categorySlug: string }>
}

export default async function CategoryMapPage(props: Props) {
  const { categorySlug: slug } = await props.params
  const category = await fetchQuery(api.pois.categories.getBySlug, { slug })

  if (!category) {
    return notFound()
  }

  return (
    <PlacesMapProvider categories={[category._id]}>
      <PlaceMapWidget />
    </PlacesMapProvider>
  )
}
