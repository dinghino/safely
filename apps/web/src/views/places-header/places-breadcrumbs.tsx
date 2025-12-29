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
import { cn } from '@/lib/utils'
import type { CategoryGroup, CategoryItem, Place } from '@/entities/places/types'
import { MapPinIcon } from 'lucide-react'

export namespace PlacesBreadcrumbs {
  export type Props = {
    className?: string
    group?: CategoryGroup | null
    category?: CategoryItem | null
    place?: Place | null
  }
}

export function PlacesBreadcrumbs({ className, group, category, place }: PlacesBreadcrumbs.Props) {
  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {group ? (
            <BreadcrumbLink asChild>
              <Link href="/places" className="group flex items-center gap-1">
                <MapPinIcon className="size-3.5 opacity-50 group-hover:opacity-100" /> Places
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              Places
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {group && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {category ? (
                <BreadcrumbLink asChild>
                  <Link href={`/places/${group.slug}`}>{group.name}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{group.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {place ? (
                <BreadcrumbLink asChild>
                  <Link href={`/places/${group?.slug}/${category.slug}`}>{category.name}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
