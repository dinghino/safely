'use client'

import Link from 'next/link'
import type { Id } from '@workspace/backend/dataModel'

import { Badge } from '@workspace/ui/components/badge'

import { cn } from '@/lib/utils'

import { PoiCategoryColorBadge, CategoryIcon } from '@/entities/places/categories'
import type { CategoryGroup } from '@/entities/places/types'
import { usePoiGroupCategoriesById } from '@/features/poi-categories/hooks'

import { PlaceFiltersFacade } from '@/features/place-filters'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'
import { usePoiCategoryGroups } from '@/features/poi-categories/hooks'
import { FilteredMapProvider, PlaceListWidget, PlaceMapWidget } from '@/widgets/places'
import { ScrapedCellsLayer } from '@/shared/modules/admin/place-coverage/components/scraped-cells-layer'
import type { PoiCategory } from '@workspace/backend/types'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

/**
 * Main default page for places route.
 * This shows dynamic Places based on map view and filters.
 *
 * Layout:
 * - Placeholder for future personalized places
 * - Filter controls (categories, search)
 * - Interactive map + list view
 * - Category group navigation cards
 */
export default function PlacesPage() {
  const groups = usePoiCategoryGroups()

  return (
    <div className="isolate space-y-6">
      {/* Placeholder for future relevant/personalized places */}
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Relevant places</EmptyTitle>
          <EmptyDescription>
            We have no places to show you at the moment. Try selecting a category group above to
            explore
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p>
            This section will contain user relevant places based on their preferences and location.
          </p>
        </EmptyContent>
      </Empty>

      {/* todo: wrap both these into context to allow sync between filters, map and lists */}
      <FilteredMapProvider>
        <PlaceFiltersFacade />
        <div className="flex h-[600px] gap-4">
          <PlaceListWidget className="w-72" />
          <PlaceMapWidget>
            <ScrapedCellsLayer />
          </PlaceMapWidget>
        </div>
      </FilteredMapProvider>

      {/* Category Navigation Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <CategoryGroupCard key={group._id} group={group} />
        ))}
      </div>
      {/* CATEGORIES CARDS EXAMPLE */}
      <div className="space-y-8">
        {groups?.map((group) => (
          <section className="flex flex-col gap-4" key={group._id}>
            <header className="group inline-flex w-full items-center gap-3">
              <h3 className="font-bold text-xl">{group.name}</h3>

              <Button asChild variant="ghost">
                <Link
                  href={`/places/${group.slug}`}
                  className={cn(
                    'opacity-25 transition-opacity group-hover:opacity-100',
                    'duration-350 ease-in-out',
                    // 'inline-flex items-center gap-0',
                    'text-xs uppercase',
                    'text-muted-foreground',
                  )}
                >
                  <span>see all</span>
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              </Button>
            </header>
            <CategoryCardList group={group} />
          </section>
        ))}
      </div>
    </div>
  )
}

// region group cards

namespace CategoryGroupCard {
  export type Props = {
    group: CategoryGroup
  }
}

/**
 * Card component for category group navigation.
 * Displays group info and links to category-specific pages.
 */
const CategoryGroupCard = ({ group }: CategoryGroupCard.Props) => {
  return (
    <article
      className={cn(
        'rounded-lg border border-dashed p-4 transition-colors hover:bg-muted dark:hover:bg-muted/10',
      )}
    >
      <header className="relative isolate inline-flex w-full cursor-pointer items-center gap-2">
        <Link href={`/places/${group.slug}`} className="absolute inset-0 z-10" />
        <PoiCategoryColorBadge data={group} className="size-4 rounded-md" />
        <h2 className="font-bold text-lg">{group.name}</h2>
      </header>
      <p className="mt-1 mb-4 text-muted-foreground text-xs">
        Explore {group.name.toLowerCase()} in your area.
      </p>
      <div className="flex flex-wrap gap-2">
        <CategoryLinks groupId={group._id} />
      </div>
    </article>
  )
}

// region category links

namespace CategoryLinks {
  export type Props = {
    groupId: Id<'poiCategoryGroup'>
  }
}

/**
 * Renders category links for a given group.
 */
const CategoryLinks = ({ groupId }: CategoryLinks.Props) => {
  const categories = usePoiGroupCategoriesById(groupId)

  return (
    <>
      {categories?.map((category) => (
        <Badge asChild variant="secondary" key={category._id} className="text-[10px]">
          <Link
            href={`/places/${category.group.slug}/${category.slug}`}
            className="inline-flex items-center gap-1"
          >
            <CategoryIcon icon={category.icon} />
            <span>{category.name}</span>
          </Link>
        </Badge>
      ))}
    </>
  )
}

// region category cards

const CategoryCard = ({ category }: { category: PoiCategory }) => {
  return (
    <article
      className={cn(
        'rounded-lg border border-muted p-4 transition-colors hover:bg-muted dark:hover:bg-muted/10',
        'flex flex-row gap-4',
        'relative isolate cursor-pointer',
      )}
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category.color.value}15` }}
      >
        <CategoryIcon
          icon={category.icon}
          style={{ color: category.color.value }}
          className="size-8"
        />
      </div>
      <header className="w-full gap-2">
        <Link href={`/places/${category.slug}`} className="absolute inset-0 z-10" />
        <h2 className="font-bold text-lg">{category.name}</h2>
        <p className="mt-1 text-muted-foreground text-xs">{category.description}</p>
      </header>
    </article>
  )
}
const CategoryCardList = ({ group }: { group: CategoryGroup }) => {
  const categories = usePoiGroupCategoriesById(group._id)

  return (
    // <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div className="space-y-4">
      {categories?.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  )
}
