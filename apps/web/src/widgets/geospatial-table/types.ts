import type { api } from '@workspace/backend/api'
import type { FunctionReturnType } from 'convex/server'

type QueryFn = typeof api.tracking.locations.getSession

export type SessionLocation = FunctionReturnType<QueryFn>[number] & {
  id: string
  // id: Id<'trackLocation'>
}
