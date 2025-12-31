import { fetchQuery } from 'convex/nextjs'

import { api } from '@workspace/backend/api'

import type { CategoryItem as Category, CategoryGroup } from '@/entities/places/types'
import { PlaceMapWidget } from '@/widgets/places'

import { SearchInput } from '@/components/search-input'
import { ViewModeControl, ViewModeProvider } from '@/components/view-mode-control'

import { ExploreSectionProvider } from './components/params-context'
import { CategoriesNavigation } from './components/categories-navigation'

type Props = {
  children: React.ReactNode
  breadcrumbs: React.ReactNode
}

export default async function ExploreLayout(props: Props) {
  const { grouped, categories } = await getGroupedCategories()

  return (
    <ExploreSectionProvider data={grouped}>
      <ViewModeProvider storageKey="places-view-mode">
        <header className="sticky top-(--header-height) z-50 flex flex-col bg-background">
          <PlaceMapWidget className="col-span-full h-[400px]" />
          <div className="bg-muted/50 py-2 content-grid">
            <div className="inline-flex items-center justify-between gap-2">
              <nav className="">{props.breadcrumbs}</nav>
              <div className="flex-1" />
              <div className="max-w-[200px]">
                <SearchInput placeholder="Search places..." disabled />
              </div>
              <ViewModeControl />
            </div>
          </div>
        </header>

        <div className="mt-8 content-grid">
          <div className="mb-4 grid grid-cols-[1fr_auto] gap-4">

            <section>
              {props.children}
            </section>
            <aside className="w-[384px] space-y-2">
              <CategoriesNavigation data={grouped} />
            </aside>
          </div>
        </div>
      </ViewModeProvider>
    </ExploreSectionProvider>
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
