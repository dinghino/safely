'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPinIcon } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'

type Params = {
  all: string[]
  coords: string
}

export function SectionBreadcrumbs() {
  const { all, coords } = useParams<Params>()

  // all contains [group?, category?] as slugs
  const pieces = useMemo(() => all ?? [], [all])

  const root = useMemo(() => `/maps/${decodeURIComponent(coords)}/explore`, [coords])

  const breadcrumbs = useMemo(() => {
    const values = pieces.map((slug, index) => {
      const prev = pieces.slice(0, index)
      const parts = [root, ...prev, slug]
      console.log('breadcrumbs creator', { slug, parts })
      return {
        href: parts.join('/'),
        label: slug,
        last: index === pieces.length - 1,
        icon: undefined,
      }
    })
    return [
      {
        href: root,
        label: 'Places',
        last: false,
        icon: <MapPinIcon className="size-3.5" />,
      },
      ...values,
    ]
  }, [pieces, root])

  console.log('breadcrumbs', { coords: decodeURIComponent(coords), pieces, breadcrumbs })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item) => (
          <Item key={item.href} {...item} />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type ItemProps = {
  href: string
  label: string
  last: boolean
  icon?: React.ReactNode
}
const Item = ({ href, label, last, icon }: ItemProps) => {
  return (
    <>
      <BreadcrumbItem>
        {last ? (
          <BreadcrumbPage>{label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild className="inline-flex items-center gap-1">
            <Link href={{ href }}>
              {icon}
              {label}
            </Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {!last && <BreadcrumbSeparator />}
    </>
  )
}
