import { notFound } from 'next/navigation'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'
import { PlacesMapProvider } from '@/features/place-map'
import { PlaceMapWidget } from '@/widgets/places'

type Props = {
  params: Promise<{ groupSlug: string }>
}

export default async function GroupMapPage(props: Props) {
  const { groupSlug: slug } = await props.params
  const categories = await fetchQuery(api.pois.categories.getByGroupSlug, { slug })

  if (!categories) {
    return notFound()
  }

  const categoryIds = categories.map((c) => c._id)

  return (
    <PlacesMapProvider categories={categoryIds}>
      <PlaceMapWidget />
    </PlacesMapProvider>
  )
}
