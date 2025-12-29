'use client'

import { use } from 'react'
import Link from 'next/link'
import { LoaderIcon } from 'lucide-react'

import { PlaceCategoryItem } from '@/entities/places/components/category-item'
import { usePoiGroupCategoriesBySlug } from '@/features/poi-categories/hooks'

type Props = {
  params: Promise<{ groupSlug: string }>
  children: React.ReactNode
}

/**
 * Layout for a group of POI categories, aggregating all categories in the group.
 *
 * Allows displaying various views and pages showing all POIs for the given
 * category group, as lists, maps, or other visualizations.
 */
export default function PoiCategoryLayout(props: Props) {
  const { groupSlug } = use(props.params)
  const categories = usePoiGroupCategoriesBySlug(groupSlug)
  return (
    <div className="grid grid-cols-[auto_1fr]">
      <div className="min-w-fit min-xl:w-[256px]">
        {!categories && <LoaderIcon className="mx-auto animate-spin" />}
        {categories && (
          <div className="space-y-2 overflow-hidden">
            {categories.map((cat) => (
              <Link href={`/places/${groupSlug}/${cat.slug}`} key={cat._id}>
                <PlaceCategoryItem
                  key={cat._id}
                  category={cat}
                  className="first:rounded-t-lg last:rounded-b-lg hover:bg-muted dark:hover:bg-muted/25"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-[600px]">{props.children}</div>
    </div>
  )
}
