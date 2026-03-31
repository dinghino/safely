import type { PaginationResult } from 'convex/server'
import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/**
 * Injects the group data into a POI category object.
 * NOTE: Use injectGroups for batching when processing many categories.
 */
export async function injectGroupData(ctx: QueryCtx, category: Doc<'poiCategory'>) {
  const group = (await ctx.db.get('poiCategoryGroup', category.groupId))!
  return { ...category, group, color: group.color }
}

/**
 * Batches the injection of group data for many categories to avoid N+1 queries.
 */
export async function injectGroups(ctx: QueryCtx, categories: Doc<'poiCategory'>[]) {
  const uniqueGroupIds = Array.from(new Set(categories.map((c) => c.groupId)))
  const groups = await Promise.all(uniqueGroupIds.map((id) => ctx.db.get('poiCategoryGroup', id)))
  const groupMap = new Map(groups.filter((g) => g !== null).map((g) => [g!._id, g!]))

  return categories.map((category) => {
    const group = groupMap.get(category.groupId)!
    // biome-ignore lint/correctness/noUnusedVariables: intentional destructuring
    const { groupId, ...rest } = category
    return { ...category, group, color: group.color }
  })
}

/**
 * wrapper for {@link injectGroupData} to work with paginated results
 */
export async function injectInPaginated(
  ctx: QueryCtx,
  paginated: PaginationResult<Doc<'poiCategory'>>,
) {
  const page = await injectGroups(ctx, paginated.page)
  return { ...paginated, page }
}

/**
 * Resolves a list of category IDs to their documents.
 * If the input list is empty, fetches ALL categories.
 */
export async function resolveCategories(ctx: QueryCtx, ids: Id<'poiCategory'>[]) {
  let categories: Doc<'poiCategory'>[]
  if (ids.length === 0) {
    categories = await ctx.db.query('poiCategory').collect()
  } else {
    const validIds = ids.filter((id) => id != null)
    const docs = await Promise.all(validIds.map((id) => ctx.db.get('poiCategory', id)))
    categories = docs.filter((c): c is NonNullable<typeof c> => c !== null)
  }

  return await injectGroups(ctx, categories)
}
