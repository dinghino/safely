import { Presence } from '@convex-dev/presence'
import { v } from 'convex/values'
import { components } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { getCurrentUserOrThrow } from './lib/auth'

export const presence = new Presence<string, Id<'users'>>(components.presence)

export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    interval: v.number(),
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, interval, userId, roomId } = args

    // do we need to validate that the userId belongs to the current user?
    const user = await getCurrentUserOrThrow(ctx)
    if (user.external_id !== userId) {
      throw new Error("Can't heartbeat for another user")
    }

    return await presence.heartbeat(ctx, roomId, user._id, sessionId, interval)
  },
})

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => await presence.list(ctx, roomToken),
})

/**
 * Handle disconnection of a presence session.
 */
export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken)
  },
})
