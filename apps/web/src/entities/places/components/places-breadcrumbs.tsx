'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@workspace/ui/components/breadcrumb'
import { usePlacesRoute } from '@/entities/places/context'
import { cn } from '@/lib/utils'

export function PlacesBreadcrumbs({ className }: { className?: string }) {
  const { groupSlug, categorySlug, placeSlug, group, category } = usePlacesRoute()

  // No logic here, just presentation

  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {groupSlug ? (
            <BreadcrumbLink asChild>
              <Link href="/places">Places</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Places</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {groupSlug && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {group && !categorySlug ? (
                <BreadcrumbPage>{group.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/places/${groupSlug}`}>{group?.name ?? '...'}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}

        {groupSlug && categorySlug && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {category && !placeSlug ? (
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/places/${groupSlug}/${categorySlug}`}>
                    {category?.name ?? '...'}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}

        {/* Place breadcrumb logic would go here once we resolve the slug/ID issue and API */}
        {/* {placeSlug && (
          <>
             <BreadcrumbSeparator />
             <BreadcrumbItem>
               <BreadcrumbPage>{placeSlug}</BreadcrumbPage>
             </BreadcrumbItem>
          </>
        )} */}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
