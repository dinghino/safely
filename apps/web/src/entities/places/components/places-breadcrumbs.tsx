import React from 'react'
import Link from 'next/link'
import { MapPinIcon } from 'lucide-react'

import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'

export namespace PlacesBreadcrumbs {
  export type Props = {
    root: React.ComponentProps<typeof Link>['href']
    breadcrumbs: {
      href: string
      label: string
      last: boolean
    }[]
  }
}

/**
 * @deprecated probably. we are building this 100 times all around
 * because routing is fucking hard. we'll figure it out
 * soon and centralize them.
 */
export default async function PlacesBreadcrumbs(props: PlacesBreadcrumbs.Props) {
  const { root, breadcrumbs } = props

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="inline-flex items-center gap-1">
            <Link href={root}>
              <MapPinIcon className="size-3.5" />
              Places
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {breadcrumbs.map(({ href, label, last }) => {
          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={{ href }}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type Normalized = {
  name: string
  slug: string
}
/**
 *
 * @param slugs string or [group-slug, category-slug?]
 * @param start
 * @returns
 */
export async function fetchSegmentsData(slugs: string[], start = 2): Promise<Normalized[]> {
  const relative = slugs.slice(start)
  const groupSlug = relative[0]
  const categorySlug = relative[1]

  const group = await fetchQuery(api.pois.groups.getBySlug, { slug: groupSlug ?? 'skip' })
  const category = await fetchQuery(api.pois.categories.getBySlug, { slug: categorySlug ?? 'skip' })

  const list = [group, category].filter((i) => !!i)
  return list
}
function makeUrl(items: Normalized[], root: string) {
  // Ensure root doesn't have trailing slash
  const base = root.endsWith('/') ? root.slice(0, -1) : root
  return `${base}/${items.map((i) => i.slug).join('/')}`
}

export async function preparePlacesBreadcrumbs(opts: {
  slugs: string[]
  startAt?: number
  root?: string
}) {
  const { slugs, startAt = 2, root = '' } = opts
  const list = await fetchSegmentsData(slugs, startAt)

  const urls = list.reduce(
    (acc, item, idx, arr) => {
      const href = makeUrl(arr.slice(0, idx + 1), root)
      acc.push({ href, label: item.name })
      return acc
    },
    [] as { href: string; label: string }[],
  )

  const breadcrumbs = urls.map(({ href, label }, index) => {
    return {
      href,
      label,
      last: index === urls.length - 1,
    }
  })

  return breadcrumbs
}
