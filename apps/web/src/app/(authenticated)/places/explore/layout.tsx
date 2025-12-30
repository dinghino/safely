import Link from 'next/link'
import { fetchQuery } from 'convex/nextjs'
import { ChevronRightIcon } from 'lucide-react'

import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'

import type { CategoryItem as Category, CategoryGroup } from '@/entities/places/types'
import { PlaceCategoryItem } from '@/entities/places/components/category-item'
import { CategorySelect } from '@/entities/places/category-select'
import { PlaceMapWidget } from '@/widgets/places'

import { ExploreSectionProvider } from './components/params-context'
import { ExplorePageTitle } from './components/explore-page-title'
import { SearchInput } from '@/components/search-input'
import { ViewModeControl, ViewModeProvider } from '@/components/view-mode-control'

type Props = {
  children: React.ReactNode
  breadcrumbs: React.ReactNode
}

export default async function ExploreLayout(props: Props) {
  const { grouped, categories } = await getGroupedCategories()

  return (
    <ExploreSectionProvider data={grouped}>
      <ViewModeProvider>
        <header className="sticky top-(--header-height) z-50 flex flex-col gap-2 bg-background pb-2">
          <PlaceMapWidget className="col-span-full h-[400px]" />
          {/* todo: add content-grid wrapper? */}
          <div className="content-grid">
            <div className="inline-flex items-center justify-between gap-2">
              <nav className="">{props.breadcrumbs}</nav>
              <div className="flex-1" />
              {/* <CategorySelect categories={categories} className="max-w-[200px]" /> */}
              <div className="max-w-[200px]">
                <SearchInput placeholder="Search places..." />
              </div>
              <ViewModeControl />
            </div>
          </div>
        </header>

        <div className="content-grid">
          <div className="mb-4 grid grid-cols-[1fr_3fr_1fr] grid-rows-[auto_1fr] gap-4">
            <aside className="space-y-4">
              {Array.from(grouped.entries()).map(([group, categories]) => (
                <div key={group._id}>
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href={`/places/explore/${group.slug}`}>
                      <h2 className="font-bold text-lg">{group.name}</h2>
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        href={`/places/explore/${group.slug}/${category.slug}`}
                        key={category._id}
                        className="hover:bg-muted/50"
                      >
                        <PlaceCategoryItem category={category} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
            <section>
              <ExplorePageTitle />
              {props.children}
            </section>
            <aside>
              <p>empty</p>
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
