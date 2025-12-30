import { fetchQuery } from 'convex/nextjs'
import { notFound } from 'next/navigation'
import { api } from '@workspace/backend/api'
import { Skeleton } from '@workspace/ui/components/skeleton'

type Props = {
  params: Promise<{ groupSlug: string }>
}
export default async function PoiCategoryGroupPage(props: Props) {
  const { groupSlug: slug } = await props.params
  const group = await fetchQuery(api.pois.groups.getBySlug, { slug })
  if (!group) notFound()

  return (
    <div className="">
      <h1>Category Group page</h1>
      {group ? <p>Group: {group?.name}</p> : <Skeleton className="h-4 w-24" />}
      <p>show places in the given category group and select category for narrow search</p>
    </div>
  )
}
