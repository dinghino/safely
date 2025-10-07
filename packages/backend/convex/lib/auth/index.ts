import type { QueryCtx } from '../../_generated/server'

/**
 * Get current user from convex DB or throw
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx)
  if (!userRecord) throw new Error("Can't get current user")
  return userRecord
}

/**
 * Get current user from convex DB or null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    return null
  }
  return await userByExternalId(ctx, identity.subject)
}

/**
 * Internal query to get a user by their external ID (clerk id)
 */
export async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_external_id', (q) => q.eq('external_id', externalId))
    .unique()
}
