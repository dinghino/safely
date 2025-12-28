'use client'

import { PoiCategoryColorBadge } from '@/entities/places/categories'
import { PlacesBreadcrumbs } from '@/entities/places/components/places-breadcrumbs'
import { PlacesRouteProvider } from '@/entities/places/context'
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
    <PlacesRouteProvider>
      <div className="mb-4 grid grid-cols-1 grid-rows-[auto_1fr] gap-4">
        <header className="sticky top-(--header-height) z-50 flex flex-col gap-2 bg-muted">
          {/* <div className="mx-4 pt-6 pb-4">
            <h1 className="font-bold text-2xl">Explore Places</h1>
            <p className="text-muted-foreground text-sm">What's around you and relevant</p>
          </div> */}
          <div className="h-[384px] w-full overflow-hidden">{map}</div>
          <div className="content-grid pb-2">
            <PlacesBreadcrumbs />
          </div>
        </header>
        <div className="content-grid">
          <header className="mb-4 h-fit">
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
        </div>
        <section className="content-grid">{children}</section>
      </div>
    </PlacesRouteProvider>
  )
}
