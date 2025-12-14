import type { PaginationResult } from 'convex/server'
import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/**
 * Injects the group data into a POI category object.
 */
export async function injectGroupData(ctx: QueryCtx, category: Doc<'poiCategory'>) {
  // `groupId` is required on `poiCategory`, so fetch and attach the group.
  const data = (await ctx.db.get('poiCategoryGroup', category.groupId))!
  const { color, ...group } = data
  const { groupId, ...categoryWithoutGroupId } = category
  return { ...categoryWithoutGroupId, group, color }
}

/**
 * wrapper for {@link injectGroupData} to work with paginated results
 */
export async function injectInPaginated(
  ctx: QueryCtx,
  paginated: PaginationResult<Doc<'poiCategory'>>,
) {
  const withGroup = paginated.page.map((category) => injectGroupData(ctx, category))
  const page = await Promise.all(withGroup)
  return { ...paginated, page }
}
