'use client'

import { PoiCategoryColorBadge } from '@/entities/poi/categories'
import { usePoiCategoryGroups } from '@/features/poi-categories/hooks'
import { Badge } from '@workspace/ui/components/badge'
import Link from 'next/link'

type Props = {
  children: React.ReactNode
}
/**
 * Root layout for Places views. Renders category group navigation at the top
 */
export default function PoiCategoryGroupPage(props: Props) {
  const groups = usePoiCategoryGroups()
  return (
    <div className="my-4 space-y-4 content-grid">
      <header>
        <h1 className="font-bold text-2xl">Explore Places</h1>
        <p className="text-muted-foreground text-sm">What's around you and relevant</p>
      </header>
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
      {props.children}
    </div>
  )
}
