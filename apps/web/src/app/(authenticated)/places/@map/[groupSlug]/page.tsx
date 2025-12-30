import { notFound } from 'next/navigation'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'
import { PlacesMapHeader } from '@/views/places-header'

type Props = {
  params: Promise<{ groupSlug: string }>
}

export default async function GroupMapPage(props: Props) {
  const { groupSlug: slug } = await props.params
  const group = await fetchQuery(api.pois.groups.getBySlug, { slug })

  if (!group) return notFound()

  // We need categories for the map filter
  const categories = await fetchQuery(api.pois.categories.getByGroupId, { groupId: group._id })
  const categoryIds = categories.map((c) => c._id)

  return <PlacesMapHeader categoryIds={categoryIds} breadcrumbs={{ group }} />
}
