'use client'

import Link from 'next/link'
import { ChevronDownCircleIcon, ChevronRightIcon } from 'lucide-react'

import type { Id } from '@workspace/backend/dataModel'
import { Badge } from '@workspace/ui/components/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { Button } from '@workspace/ui/components/button'

import { cn } from '@/lib/utils'

import { PoiCategoryColorBadge, CategoryIcon } from '@/entities/places/categories'
import type { CategoryGroup } from '@/entities/places/types'
import { PlaceCategoryItem } from '@/entities/places/components/category-item'

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
import { RelevantPlaces } from './explore/components/relevant-places'

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
      <RelevantPlaces />

      {/* Category Navigation Section */}
      <section className="grid grid-cols-[1fr_3fr_1fr] gap-4">
        {/* <div className="space-y-8">
          {groups?.map((group) => (
            <article className="flex flex-col gap-4" key={group._id}>
              <header className="inline-flex w-full items-center gap-3">
                <Button asChild variant="ghost" className="group w-fit">
                  <Link href={`/places/explore/${group.slug}`}>
                    <h3 className="font-bold text-xl">{group.name}</h3>
                    <ChevronRightIcon
                      className={cn(
                        'opacity-25 transition-opacity group-hover:opacity-100',
                        'transition-transform group-hover:translate-x-1',
                        'duration-250 ease-in-out',
                        'inline-flex items-center gap-0',
                        'text-xs uppercase',
                        'text-muted-foreground',
                      )}
                    />
                  </Link>
                </Button>
              </header>
              <CategoryCardList group={group} />
            </article>
          ))}
        </div> */}
        <div className="relative space-y-8">
          {groups?.map((group) => (
            <article key={group._id} className="space-y-3">
              <header className="flex justify-between gap-4">
                <Button asChild variant="ghost" className="group w-full justify-between">
                  <Link href={`/places/explore/${group.slug}`}>
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <ChevronRightIcon
                      className={cn(
                        'opacity-25 transition-opacity group-hover:opacity-100',
                        'transition-transform group-hover:translate-x-1',
                        'duration-250 ease-in-out',
                        'inline-flex items-center gap-0',
                        'text-xs uppercase',
                        'text-muted-foreground',
                      )}
                    />
                  </Link>
                </Button>
              </header>
              <div className="space-y-1">
                <CategoryCardList group={group} />
              </div>
            </article>
          ))}
        </div>
        <div className="space-y-4">
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
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            {groups?.map((group) => (
              <CategoryGroupCard key={group._id} group={group} className="" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// region group cards

namespace CategoryGroupCard {
  export type Props = {
    group: CategoryGroup
    className?: string
  }
}

/**
 * Card component for category group navigation.
 * Displays group info and links to category-specific pages.
 */
const CategoryGroupCard = ({ group, className = '' }: CategoryGroupCard.Props) => {
  return (
    <article
      className={cn(
        'rounded-lg border border-dashed p-4 transition-colors hover:bg-muted dark:hover:bg-muted/10',
        className,
      )}
    >
      <header className="relative isolate inline-flex w-full cursor-pointer items-center gap-2">
        <Link href={`/places/explore/explore/${group.slug}`} className="absolute inset-0 z-10" />
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
            href={`/places/explore/${category.group.slug}/${category.slug}`}
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

const CategoryCardList = ({ group }: { group: CategoryGroup }) => {
  const categories = usePoiGroupCategoriesById(group._id)

  return (
    <>
      {categories?.map((category) => (
        <Button
          asChild
          key={category._id}
          variant="ghost"
          className="h-fit w-full border border-muted p-0! hover:bg-muted/50"
        >
          <Link href={`/places/explore/${category.group.slug}/${category.slug}`} className="w-full">
            <PlaceCategoryItem variant="lg" category={category} className="w-full" />
          </Link>
        </Button>
      ))}
    </>
  )
}
