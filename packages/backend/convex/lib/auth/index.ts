import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import * as nanoid from 'nanoid'
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

// region device session token

/**
 * Generate a new device session token
 * @note this will be enhanced and modified later with some parameters to allow
 *   some type of control and customization over the generated tokens
 */
class DeviceTokenService {
  VERSION = 1
  SEPARATOR = ':'
  PREFIX = 'dst'

  get generator() {
    return nanoid.customRandom(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
      48,
      nanoid.random,
    )
  }

  generate() {
    const token = this.generator()
    const pre = this.PREFIX
    const version = this.VERSION.toString().padStart(2, '0')
    const sep = this.SEPARATOR

    return `${pre}:${version}${sep}${token}`
  }
}

export function generateDeviceSessionToken() {
  const generator = new DeviceTokenService()
  return generator.generate()
}

// endregion

// region device auth
