'use client'
import { cn } from '@/lib/utils'
import { api } from '@workspace/backend/api'
import { Badge } from '@workspace/ui/components/badge'
import { useQuery } from 'convex/react'

/**
 * Fully featured health check component to show the status of the API.
 */
export function HealthCheck() {
  const healthCheck = useQuery(api.system.healthcheck)

  const isOk = healthCheck === 'OK'
  const isUnknown = healthCheck === undefined
  return (
    <Badge variant="secondary" className="space-x-2">
      <div
        className={cn('h-2 w-2 rounded-full', {
          'bg-green-500': isOk,
          'bg-orange-400': isUnknown,
          'bg-red-500': !isOk && !isUnknown,
        })}
      />
      <span>{isOk ? 'Connected' : 'Error'}</span>
    </Badge>
  )
}
