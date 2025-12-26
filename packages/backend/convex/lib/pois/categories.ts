import type { PaginationResult } from 'convex/server'
import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/**
 * Injects the group data into a POI category object.
 */
export async function injectGroupData(ctx: QueryCtx, category: Doc<'poiCategory'>) {
  // `groupId` is required on `poiCategory`, so fetch and attach the group.
  const group = (await ctx.db.get('poiCategoryGroup', category.groupId))!
  const { color } = group
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

/**
 * Resolves a list of category IDs to their documents.
 * If the input list is empty, fetches ALL categories.
 */
export async function resolveCategories(
  ctx: QueryCtx,
  ids: Id<'poiCategory'>[],
): Promise<Doc<'poiCategory'>[]> {
  if (ids.length === 0) {
    return await ctx.db.query('poiCategory').collect()
  }
  const docs = await Promise.all(ids.map((id) => ctx.db.get(id)))
  return docs.filter((c): c is NonNullable<typeof c> => c !== null)
}
