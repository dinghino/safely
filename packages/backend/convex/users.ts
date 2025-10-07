/** @format */

import type { UserJSON } from '@clerk/backend'
import { type Validator, v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getCurrentUser, userByExternalId } from './lib/auth'

export const current = query({
  handler: async (ctx) => await getCurrentUser(ctx),
})

// ----------------------------------------------------------------------------
// Internals for syncing Clerk users via webhooks
// ----------------------------------------------------------------------------

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      external_id: data.id,
      image: data.image_url ?? undefined,
      username: data.username ?? undefined,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
    }

    const user = await userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert('users', userAttributes)
    } else {
      await ctx.db.patch(user._id, userAttributes)
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
    }
  },
})
