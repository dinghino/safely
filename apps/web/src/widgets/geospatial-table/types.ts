import type { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import type { FunctionReturnType } from 'convex/server'

type QueryFn = typeof api.tracking.getSessionLocations

export type SessionLocation = FunctionReturnType<QueryFn>[number] & {
  id: string
  // id: Id<'trackLocation'>
}
