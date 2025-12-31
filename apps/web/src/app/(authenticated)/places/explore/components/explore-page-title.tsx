'use client'

import { cn } from '@/lib/utils'
import { useParamsContext } from './params-context'

/**
 * Dynamic page title based on the current category or group
 * @deprecated currently unused. we'll see if we need it
 */
export const ExplorePageTitle = ({ className }: { className?: string }) => {
  const { group, category } = useParamsContext()
  return <h1 className={cn('mb-6 font-bold text-xl', className)}>Explore {category ?? group}</h1>
}
