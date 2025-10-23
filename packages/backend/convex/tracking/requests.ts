import { v } from 'convex/values'
import { mutation, type MutationCtx, query } from '../_generated/server'
import { internal } from '../_generated/api'

import { getCurrentUserOrThrow } from '../lib/auth'
import { trackingRequestType } from '../schemas/enums'
import type { Id } from '../_generated/dataModel'

/**
 * Returns THE open request for the given target device, if any.
 * We assume there can be only one at a time, but this may change in the future.
 */
export const getOpen = query({
  args: { target: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    const { target } = args
    if (!target) return null
    const user = await getCurrentUserOrThrow(ctx)

    const device = await ctx.db.get(target)
    if (!isOwnedByTheUser(device, user)) return null

    return await ctx.db
      .query('trackRequests')
      .withIndex('acknowledged', (q) => q.eq('target', target).eq('acknowledged', false))
      .first()
  },
})

export const create = mutation({
  args: {
    // the device we want to track
    target: v.id('devices'),
    // the device asking for the request
    from: v.id('devices'),
    type: trackingRequestType,
  },
  handler: async (ctx, args) => {
    const { target, from, type } = args
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

    /**
     * @note needs refactor when we add request lifecycle management
     * (acknowledgement, denial, expiration, etc).
     * for now we allow only one pending request per target device
     */
    const existingRequest = await ctx.db
      .query('trackRequests')
      .withIndex('acknowledged', (q) => q.eq('target', targetDevice._id).eq('acknowledged', false))
      .first()

    if (existingRequest) {
      throw new Error('Device already has a pending request')
    }

    return ctx.db.insert('trackRequests', {
      sender: fromDevice._id,
      target: targetDevice._id,
      owner: user._id,
      acknowledged: false,
      session: null,
      type: type,
    })
  },
})

/**
 * Remove a pending request by its id.
 * @todo complete implementation with checks:
 * - only requesting user (from sender.owner) or target owner can remove a request
 * - only if not acknowledged yet
 * - by status when we add actual request statuses
 */
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

/**
 * allow a device to acknowledge a request, telling the server it's
 * ready to do what it needs.
 *
 * Server is then in charge of starting a new session for the target device
 * with an internal mutation; the device can listen to active sessions and
 * use those to send location points.
 */
export const acknowledge = mutation({
  args: { requestId: v.id('trackRequests') },
  handler: async (ctx, args) => {
    const { requestId } = args

    const user = await getCurrentUserOrThrow(ctx)
    const request = await ctx.db.get(requestId)
    // todo: acknowledgement should be done by the target device
    // todo: move request ownership above this
    if (!isOwnedByTheUser(request, user)) throw new Error('Request not found')

    // ensure that the device in the request exists and the request is for it
    const device = await ctx.db.get(request.target)
    if (!device || !isRequestForDevice(request, device))
      throw new Error('Request not for this device')

    // the client acknowledged the request
    await ctx.db.patch(request._id, { acknowledged: true })

    // ------------------------------------------------------------------------
    // we can do all the checks we need in here to ensure the acknowledgement
    // is valid and we can proceed to create a session for the target device
    // ...
    // ...
    // ------------------------------------------------------------------------

    try {
      switch (request.type) {
        case 'start': {
          // creating a new session -- this can throw errors so if we want to
          // acknowledge regardless
          return await dispatchCreateSession(ctx, device._id, request._id)
        }
        case 'stop':
          return await dispatchCloseSession(ctx, device._id, request._id)
        default:
          throw new Error('Invalid request type')
      }
    } catch (error) {
      console.warn('Error creating session from request:', { error, request, device })

      // todo: handle error, but we can't throw. the request is acknowledged
      // and since the mutation is a transaction it would revert everything.
      // - read docs: do invoking a mutation inside another gets rolled back if the
      //   outer fails?
      //   otherwise we can make some inner to handle different requests
    }
    return false
  },
})

// ----------------------------------------------------------------------------
// local helpers
// ----------------------------------------------------------------------------

async function dispatchCreateSession(
  ctx: MutationCtx,
  deviceId: Id<'devices'>,
  requestId: Id<'trackRequests'>,
) {
  const session = await ctx.runMutation(internal.tracking.sessions.create, { deviceId })
  await ctx.db.patch(requestId, { session, acknowledged: true })
  return true
}

async function dispatchCloseSession(
  ctx: MutationCtx,
  deviceId: Id<'devices'>,
  requestId: Id<'trackRequests'>,
) {
  const session = await ctx.runMutation(internal.tracking.sessions.close, { deviceId })
  await ctx.db.patch(requestId, { session, acknowledged: true })
  return true
}

// todo: move to root `lib`
/**
 * Type guard to check if a device belongs to a given user
 * @returns true if device is not null and owned by the user
 */
function isOwnedByTheUser<T extends { owner: string }>(
  device: T | null,
  user: { _id: string },
): device is T {
  return device !== null && device.owner === user._id
}

/**
 * Checks that two devices belong to the same owner
 */
function isSameOwner(device1: { owner: string }, device2: { owner: string }) {
  return device1.owner === device2.owner
}

/**
 * Type guard to check if a request is for a given device
 * @returns true if request is not null and is for the given device
 */
function isRequestForDevice<T extends { target: string }>(
  request: T | null,
  device: { _id: string } | null,
): request is T {
  return request !== null && device !== null && request.target === device._id
}
