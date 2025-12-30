'use client'

import { cn } from '@/lib/utils'
import { useParamsContext } from './params-context'

export const ExplorePageTitle = ({ className }: { className?: string }) => {
  const { group, category } = useParamsContext()
  return <h1 className={cn('mb-6 font-bold text-xl', className)}>Explore {category ?? group}</h1>
}
