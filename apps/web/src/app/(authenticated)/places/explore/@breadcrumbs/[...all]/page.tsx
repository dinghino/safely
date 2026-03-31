import React from 'react'
import Link from 'next/link'
import { MapPinIcon } from 'lucide-react'

import { fetchQuery } from 'convex/nextjs'
import { api } from '@workspace/backend/api'

import PlacesBreadcrumbs, {
  preparePlacesBreadcrumbs,
} from '@/entities/places/components/places-breadcrumbs'

type Props = {
  params: Promise<{ all: string[] }>
}

export default async function ExploreBreadcrumbs(props: Props) {
  const { all } = await props.params
  const breadcrumbs = await preparePlacesBreadcrumbs({ slugs: all, startAt: 2 })

  return <PlacesBreadcrumbs root="/places/explore" breadcrumbs={breadcrumbs} />
}
