import { notFound } from 'next/navigation'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'
import { PlacesMapHeader } from '@/views/places-header/places-map-header'

type Props = {
  params: Promise<{ groupSlug: string; categorySlug: string }>
}

export default async function CategoryMapPage(props: Props) {
  const { groupSlug, categorySlug } = await props.params

  // Parallel fetch?
  // We need group for breadcrumbs and category for map
  const group = await fetchQuery(api.pois.groups.getBySlug, { slug: groupSlug })
  const category = await fetchQuery(api.pois.categories.getBySlug, { slug: categorySlug })

  if (!group || !category) {
    return notFound()
  }

  return <PlacesMapHeader categoryIds={[category._id]} breadcrumbs={{ group, category }} />
}
