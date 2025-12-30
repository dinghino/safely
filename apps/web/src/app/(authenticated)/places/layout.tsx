'use client'

import { PoiCategoryColorBadge } from '@/entities/places/categories'
import { usePoiCategoryGroups } from '@/features/poi-categories/hooks'
import { Badge } from '@workspace/ui/components/badge'
import Link from 'next/link'

type Props = {
  children: React.ReactNode
  map: React.ReactNode
}
/**
 * Root layout for Places views. Renders category group navigation at the top
 */
export default function PoiCategoryGroupPage(props: Props) {
  const { children, map } = props
  const groups = usePoiCategoryGroups()
  return (
    <div className="mb-4 grid grid-cols-1 grid-rows-[auto_1fr] gap-4">
      <header className="sticky top-(--header-height) z-50 flex flex-col gap-2 bg-background pb-2">
        {map}
      </header>
      <div className="content-grid">
        <div className="inline-flex flex-wrap gap-2">
          <Badge asChild variant="secondary" key="all">
            <Link href="/places">
              <span>All Places</span>
            </Link>
          </Badge>
          {groups?.map((group) => (
            <Badge asChild variant="secondary" key={group._id}>
              <Link href={`/places/${group.slug}`}>
                <PoiCategoryColorBadge data={group} />
                <span>{group.name}</span>
              </Link>
            </Badge>
          ))}
        </div>
      </div>
      <section className="content-grid">{children}</section>
    </div>
  )
}
