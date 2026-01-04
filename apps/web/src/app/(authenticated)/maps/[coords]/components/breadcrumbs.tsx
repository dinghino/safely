'use client'

import Link from 'next/link'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'

type ItemProps = {
  href: string
  label: string
  last: boolean
  icon?: React.ReactNode
}
const Item = ({ href, label, last, icon }: ItemProps) => {
  if (last) {
    return (
      <BreadcrumbItem>
        <BreadcrumbPage>{label}</BreadcrumbPage>
      </BreadcrumbItem>
    )
  }

  return (
    <>
      <BreadcrumbItem>
        <BreadcrumbLink asChild className="inline-flex items-center gap-1">
          <Link href={{ pathname: href }}>
            {icon}
            {label}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
    </>
  )
}

// region new prototype

export namespace MapSectionBreadcrumbs {
  export type Props = {
    coords: string
    root: { path: string; label: string }
    slugs?: string[]
  }
  export type Item = {
    label: string
    href: string
  }
}

/**
 * Dedicated breadcrumbs components for maps/explore section.
 * @todo get actual group and category data from server
 * @todo use data.name instead of slug
 */
export function MapSectionBreadcrumbs({ coords, root, slugs = [] }: MapSectionBreadcrumbs.Props) {
  const base = ['/maps', decodeURIComponent(coords), root.path]
  // compose the breadcrumbs pieces recursively, so each object contains [...base, ..prevSlugs, slug]
  const items = slugs.reduce(
    (acc, slug, i, arr) => {
      const href = [...base, ...arr.slice(0, i), slug].join('/')
      acc.push({ label: slug, href })
      return acc
    },
    [{ label: root.label, href: base.join('/') }] as MapSectionBreadcrumbs.Item[],
  )

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map(({ label, href }, i) => (
          <Item key={label} href={href} label={label} last={i === items.length - 1} />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
