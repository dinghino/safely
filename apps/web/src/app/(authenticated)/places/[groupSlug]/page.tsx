'use client'
import { useCategoryGroupBySlug } from '@/features/poi-categories/hooks'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { use } from 'react'

type Props = {
  params: Promise<{ groupSlug: string }>
}
export default function PoiCategoryGroupPage(props: Props) {
  const { groupSlug } = use(props.params)
  const group = useCategoryGroupBySlug(groupSlug)
  return (
    <div className="">
      <h1>Category Group page</h1>
      {group ? <p>Group: {group?.name}</p>: <Skeleton className='h-4 w-24' />}
      <p>show places in the given category group and select category for narrow search</p>
    </div>
  )
}
