import type { api } from '@workspace/backend/api'
import type { FunctionReturnType } from 'convex/server'
export type CategoryItem = NonNullable<FunctionReturnType<typeof api.pois.categories.get>>
export type CategoryGroup = NonNullable<FunctionReturnType<typeof api.pois.groups.get>>

export type Place = NonNullable<FunctionReturnType<typeof api.pois.get.inView>>['pois'][number]

// /** Minimal group data for display */
// export type CategoryGroup = {
//   _id: Id<'poiCategoryGroup'>
//   name: string
//   slug: string
//   color: { format: string; value: string }
// }

// /** Minimal category data for display */
// export type CategoryItem = {
//   _id: string
//   name: string
//   slug: string
//   groupId: string
//   icon: { name: string }
//   color: { format: string; value: string }
// }
