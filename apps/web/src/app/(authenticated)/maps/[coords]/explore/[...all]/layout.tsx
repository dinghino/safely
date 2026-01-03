import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'
import type { CategoryGroup, CategoryItem as Category } from '@/entities/places/types'
import { ParamsSync } from '../components/params-sync'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

type Props = {
  children: React.ReactNode
}

export default async function MapExploreLayout(props: Props) {

  const { grouped } = await getGroupedCategories()
  return (
    // <div className="relative flex h-full flex-1 flex-col gap-4">
    <>
      <ParamsSync data={grouped} />
      <ScrollArea className="-mr-4 flex-1 pr-4">
        {props.children}
      </ScrollArea>
    </>
    // </div>
  )
}

async function getGroupedCategories() {
  const categories = await fetchQuery(api.pois.categories.all)

  //1. extract the groups from the categories array, creating a set of all the groups
  const groups = Object.values(
    categories.reduce(
      // biome-ignore lint/performance/noAccumulatingSpread: ???
      (p, c) => ({ ...p, [c.group._id]: c.group }),
      {} as Record<string, CategoryGroup>,
    ),
  )
  //2. create a map of groups to categories
  const grouped = new Map<CategoryGroup, Category[]>()

  groups.forEach((group) => {
    grouped.set(
      group,
      categories.filter((category) => category.group._id === group._id),
    )
  })
  return { grouped, categories, groups }
}
