'use client'

import { CategoryIcon, PoiCategoryColorBadge } from '@/entities/poi/categories'
import { usePoiCategoryGroups, usePoiGroupCategoriesById } from '@/features/poi-categories/hooks'
import { cn } from '@/lib/utils'
import type { Id } from '@workspace/backend/dataModel'
import { Badge } from '@workspace/ui/components/badge'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import Link from 'next/link'

/**
 * Main default page for places route.
 * This will show dynamic POIs based on user preferences and current location
 * in the future. for now, it shows category groups to select from
 */
export default function PoiCategoryGroupPage() {
  const groups = usePoiCategoryGroups()

  return (
    <>
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
      <div className="space-y-4">
        {groups?.map((group) => (
          <article
            key={group._id}
            className={cn(
              'rounded-lg border border-dashed p-4 transition-colors hover:bg-muted dark:hover:bg-muted/10',
            )}
          >
            <div>
              <header
                className={cn(
                  'inline-flex items-center gap-2',
                  'relative isolate w-full cursor-pointer',
                )}
              >
                <Link href={`/places/${group.slug}`} className="absolute inset-0 z-10" />
                <PoiCategoryColorBadge data={group} className="size-4 rounded-md" />
                <h2 className="font-bold text-lg">{group.name}</h2>
              </header>
              <p className="text-muted-foreground text-sm">
                We have no places to show you at the moment. Try selecting a category group above to
                explore
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryLinks groupId={group._id} />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

const CategoryLinks = (props: { groupId: Id<'poiCategoryGroup'> }) => {
  const categories = usePoiGroupCategoriesById(props.groupId)

  return (
    <>
      {categories?.map((category) => (
        <Badge asChild variant="secondary" key={category._id}>
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
