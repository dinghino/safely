import type { QueryCtx } from '../_generated/server'

/**
 * Resolves the system user responsible for seeding POIs.
 * Uses SEEDER_USERNAME environment variable to find the user.
 *
 * @throws Error if SEEDER_USERNAME is not set or user is not found.
 */
export async function getSeederUser(ctx: QueryCtx) {
  const username = process.env.SEEDER_USERNAME
  if (!username) {
    throw new Error('SEEDER_USERNAME environment variable is not set')
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_username', (q) => q.eq('username', username))
    .unique()

  if (!user) {
    throw new Error(`Seeder user with username "${username}" not found`)
  }

  return user
}
