import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getCurrentUserOrThrow } from '../auth'
import { _getActiveSession } from './lib'
import { internal } from '../_generated/api'

/**
 * Returns THE open request for the given target device, if any.
 * We assume there can be only one at a time, but this may change in the future.
 */
export const getOpen = query({
  args: { target: v.id('devices') },
  handler: async (ctx, args) => {
    const { target } = args
    const user = await getCurrentUserOrThrow(ctx)

    const device = await ctx.db.get(target)
    if (!isOwnedByTheUser(device, user)) throw new Error('Device not found')

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
    /**
     * @note needs refactor when we add request lifecycle management
     * (acknowledgement, denial, expiration, etc)
     */
    const existingRequest = await ctx.db
      .query('trackRequests')
      .withIndex('acknowledged', (q) => q.eq('target', targetDevice._id).eq('acknowledged', false))
      .first()

    if (existingRequest) {
      throw new Error('Device already has a pending request')
    }

    // check we don't have an active session for the given target device
    // todo: remove this when we add request type and lifecycle management
    // - stop request only work against active sessions
    // - start only if no active session
    // we can either ignore the requests or throw
    const activeSession = await _getActiveSession({ ctx, deviceId: targetDevice._id })
    if (activeSession) {
      throw new Error('There is already an active session for this device')
    }

    return ctx.db.insert('trackRequests', {
      sender: fromDevice._id,
      target: targetDevice._id,
      owner: user._id,
      acknowledged: false,
      session: null,
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
    // todo: do we check like this? requests MIGHT come from other users in the future
    // so this would fail if the target device is owned by another user (which is ctx user)
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
      // creating a new session -- this can throw errors so if we want to acknowledge
      // regardless, this should be in a try/catch block
      const session = await ctx.runMutation(internal.tracking.sessions.create, {
        deviceId: device._id,
      })
      await ctx.db.patch(request._id, { session, acknowledged: true })
    } catch (error) {
      console.error('Error creating session from request:', error)
      // todo: handle error, but we can't throw. the request is acknowledged
      // and since the mutation is a transaction it would revert everything.
      // - read docs: do invoking a mutation inside another gets rolled back if the
      //   outer fails?
      //   otherwise we can make some inner to handle different requests
    }
  },
})

// ----------------------------------------------------------------------------
// local helpers
// ----------------------------------------------------------------------------
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
