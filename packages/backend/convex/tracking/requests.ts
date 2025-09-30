import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getCurrentUserOrThrow } from '../auth'
import { _getActiveSession } from './lib'

export const create = mutation({
  args: {
    // the device we want to track
    target: v.id('devices'),
    // the device asking for the request
    from: v.id('devices'),
  },
  handler: async (ctx, args) => {
    const { target, from } = args
    const user = await getCurrentUserOrThrow(ctx)
    const targetDevice = await ctx.db.get(target)
    const fromDevice = await ctx.db.get(from)

    /**
     * Security checks
     * @note this is where we might add logic to allow tracking requests for
     * devices of other users, for example family members or due particular conditions
     */
    if (!isOwnedByTheUser(targetDevice, user)) throw new Error('Target device is not yours')
    if (!isOwnedByTheUser(fromDevice, user)) throw new Error('Requesting device is not yours')
    if (!isSameOwner(targetDevice, fromDevice))
      throw new Error('Cannot request tracking for devices of another users')

    // only one open request for a target device at a time since there can only
    // be one active session at a time

    // check we don't have an active session for the given target device
    const activeSession = await _getActiveSession({ ctx, deviceId: targetDevice._id })
    if (activeSession) {
      throw new Error('There is already an active session for this device')
    }

    /**
     * @note needs refactor when we add request lifecycle management
     * (acknowledgement, denial, expiration, etc)
     */
    const existingRequest = await ctx.db
      .query('trackRequests')
      .withIndex('target', (q) => q.eq('target', targetDevice._id))
      .first()

    if (existingRequest) {
      return existingRequest._id
    }
    return ctx.db.insert('trackRequests', {
      sender: fromDevice._id,
      target: targetDevice._id,
      owner: user._id,
    })
  },
})

export const remove = mutation({
  args: { requestId: v.id('trackRequests') },
  handler: async (ctx, args) => {
    const { requestId } = args
    const user = await getCurrentUserOrThrow(ctx)
    const request = await ctx.db.get(requestId)

    if (!isOwnedByTheUser(request, user)) throw new Error('Request not found')

    await ctx.db.delete(requestId)
  },
})

export const byTarget = query({
  args: { target: v.id('devices') },
  handler: async (ctx, args) => {
    const { target } = args
    const user = await getCurrentUserOrThrow(ctx)

    const request = await ctx.db
      .query('trackRequests')
      .withIndex('target', (q) => q.eq('target', target))
      .first()

    /**
     * See above about request lifecycle management
     */
    if (!isOwnedByTheUser(request, user)) throw new Error('Request not found')
    return request
  },
})

// todo: add some `acknowledge` mutation that will create a session for the target?
// we already can handle this in sessions.start, but it might be cleaner to have
// a dedicated mutation for this

// ----------------------------------------------------------------------------
// local helpers
// ----------------------------------------------------------------------------

function isOwnedByTheUser<T extends { owner: string }>(
  device: T | null,
  user: { _id: string },
): device is T {
  return device !== null && device.owner === user._id
}

function isSameOwner(device1: { owner: string }, device2: { owner: string }) {
  return device1.owner === device2.owner
}
