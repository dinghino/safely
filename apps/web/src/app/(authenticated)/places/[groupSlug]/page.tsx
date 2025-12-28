import { PlacesMapProvider } from '@/features/place-map'
import { PlaceMapWidget, PlaceListWidget } from '@/widgets/places'
import { Skeleton } from '@workspace/ui/components/skeleton'
// import { use } from 'react'
import { api } from '@workspace/backend/api'
import { fetchQuery } from 'convex/nextjs'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ groupSlug: string }>
}
export default async function PoiCategoryGroupPage(props: Props) {
  const { groupSlug: slug } = await props.params
  const group = await fetchQuery(api.pois.groups.getBySlug, { slug })
  if (!group) notFound()

  const categories = await fetchQuery(api.pois.categories.getByGroupId, { groupId: group._id })

  return (
    <div className="">
      <h1>Category Group page</h1>
      {group ? <p>Group: {group?.name}</p> : <Skeleton className="h-4 w-24" />}
      <p>show places in the given category group and select category for narrow search</p>

      <PlacesMapProvider categories={categories.map((c) => c._id)} searchQuery={''}>
        <PlaceMapWidget>{/* <ScrapedCellsLayer /> */}</PlaceMapWidget>
        <PlaceListWidget className="absolute top-4 right-4 z-500 h-fit max-h-[256px] w-72 rounded-lg border bg-card/75 p-4 backdrop-blur-sm" />
      </PlacesMapProvider>
    </div>
  )
}
// export default function PoiCategoryGroupPage(props: Props) {
//   const { groupSlug } = use(props.params)
//   const group = useCategoryGroupBySlug(groupSlug)
//   const categories = usePoiGroupCategoriesById(group!._id)
//   return (
//     <div className="">
//       <h1>Category Group page</h1>
//       {group ? <p>Group: {group?.name}</p> : <Skeleton className="h-4 w-24" />}
//       <p>show places in the given category group and select category for narrow search</p>

//       <PlacesMapProvider categories={categories} searchQuery={''}>
//         <PlaceMapWidget>{/* <ScrapedCellsLayer /> */}</PlaceMapWidget>
//         <PlaceListWidget className="absolute top-4 right-4 z-500 h-fit max-h-[256px] w-72 rounded-lg border bg-card/75 p-4 backdrop-blur-sm" />
//       </PlacesMapProvider>
//     </div>
//   )
// }
