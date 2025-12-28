'use client'

import { PoiCategoryItem } from '@/entities/places/categories'
import { usePoiGroupCategoriesBySlug } from '@/features/poi-categories/hooks'
import { LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

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
    <>
      <div className="min-w-fit min-xl:w-[256px]">
        {!categories && <LoaderIcon className="mx-auto animate-spin" />}
        {categories && (
          <div className="space-y-2">
            {categories.map((cat) => (
              <Link href={`/places/${groupSlug}/${cat.slug}`} key={cat._id}>
                <PoiCategoryItem
                  key={cat._id}
                  category={cat}
                  className="rounded-md not-last:border-b pb-2 hover:bg-muted dark:hover:bg-muted/25"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1">{props.children}</div>
    </>
  )
}
