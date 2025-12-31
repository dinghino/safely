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

type Props = {
  params: Promise<{ all: string[] }>
}

export default async function ExploreBreadcrumbs(props: Props) {
  const { all } = await props.params

  // remove static segments for root page
  const list = await paramsToData(all, 2)

  const urls = list.reduce(
    (acc, item, idx, arr) => {
      const href = makeUrl(arr.slice(0, idx + 1))
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

  // if (!breadcrumbs.length) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="inline-flex items-center gap-1">
            <Link href="/places/explore">
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
async function paramsToData(slugs: string[], start = 2): Promise<Normalized[]> {
  const relative = slugs.slice(start)
  const groupSlug = relative[0]
  const categorySlug = relative[1]

  const group = await fetchQuery(api.pois.groups.getBySlug, { slug: groupSlug ?? 'skip' })
  const category = await fetchQuery(api.pois.categories.getBySlug, { slug: categorySlug ?? 'skip' })

  const list = [group, category].filter((i) => !!i)
  return list
}
function makeUrl(items: Normalized[]) {
  return `/${items.map((i) => i.slug).join('/')}`
}
