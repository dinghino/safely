import { v } from 'convex/values'

import { internalMutation, mutation, type MutationCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { api, internal } from '../_generated/api'

import { generateDeviceSessionToken, getCurrentUserOrThrow } from '../lib/auth'
import { deviceStatus, trackingMode } from '../schemas/enums'
import { helpers } from '../lib/devices'

/**
 * Allow a user to register a new device, bootstrapping all the necessary
 * data structures for a device to operate and be known to the system.
 *
 * If a session token is provided, this will act (temporarily) as a refresh
 * mechanism to revalidate and return a (new) session token for a returning
 * known device.
 * @todo this functionality will likely be moved to a dedicated "refresh" mutation
 *
 * @returns the device ID and session token to be used for future requests
 * @todo we should return a private key for the device to sign requests
 *       to avoid session token leakage and replay attacks.
 */
export const register = mutation({
  args: {
    name: v.optional(v.string()),
    platform: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const { sessionToken: token } = args
    if (token) {
      console.log('handling register with existing session token', token)
      return await handleTokenOnRegister(ctx, token, user._id)
    }

    // create new device
    // this is the normal flow for new device registrations.
    const id = await helpers.createDevice(ctx, { ...args, user })
    const { sessionId, token: sessionToken } = await createDeviceSessionAndToken(ctx, id)

    // await ctx.runMutation(api.devices.heartbeat.send, { sessionToken })
    await helpers.heartbeat.scheduleDisconnect(ctx, { sessionId, sessionToken, interval: 10_000 })

    await ctx.runMutation(internal.devices.activities.add, {
      data: helpers.createActivityLog({ deviceId: id, type: 'registered', payload: {} }),
    })

    return { deviceId: id, sessionToken }
  },
})

/**
 * Allow a user to delete one of their devices, including most associated data
 * for the device.
 * @note this will be expanded in the future to cover more associated data,
 * soft delete functionality and anonymization, as well as providing options
 * to the user to decide what they want to delete or keep.
 * @throws no device or not owned by user
 */
export const unregister = mutation({
  args: { id: v.id('devices') },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, args.id)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    // todo: move to separate functions
    const cleanupMutations = []
    // delete all options first
    const options = await ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', device._id))
      .collect()
    cleanupMutations.push(options?.map((opt) => ctx.db.delete(opt._id)))
    // cleanup last known locations
    cleanupMutations.push(helpers.location.deleteLastKnown({ ctx, deviceId: device._id }))

    // todo: stop active session is exists
    // todo: cleanup sessions, tokens, timeouts etc
    // todo: maybe (?) cleanup sessions location history

    await Promise.all(cleanupMutations.flat())
    await ctx.runMutation(internal.devices.activities.add, {
      data: helpers.createActivityLog({ deviceId: device._id, type: 'unregistered', payload: {} }),
    })
    return await ctx.db.delete(device._id)
    // todo: soft delete, anonymize or cascade delete all device data?
  },
})

/**
 * Allow a user to rename one of their devices
 * @throws no device or not owned by user
 */
export const rename = mutation({
  args: { deviceId: v.id('devices'), name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, args.deviceId)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    await ctx.runMutation(internal.devices.activities.add, {
      data: helpers.createActivityLog({
        deviceId: device._id,
        type: 'renamed',
        payload: { newName: args.name, previousName: device.name || '' },
      }),
    })
    return ctx.db.patch(device._id, { name: args.name })
  },
})

// explicit state setters

/**
 * Change the status of the given device.
 * @note this is for now internal to learn convex and might be removed or exposed later
 */
export const setState = internalMutation({
  args: { deviceId: v.id('devices'), status: deviceStatus },
  handler: async (ctx, args) => {
    const { deviceId, status } = args
    await ctx.db.patch(deviceId, { status })
  },
})

/**
 * Allow a user to explicitly and authoritatively set the tracking mode of a device
 * they own.
 * @throws if the device does not exist or is not owned by the current user
 * @note this should not be used manually and will be likely deprecated
 */
export const setTrackingMode = mutation({
  args: { deviceId: v.id('devices'), mode: trackingMode },
  handler: async (ctx, args) => {
    const { deviceId, mode } = args

    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, deviceId)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return await ctx.db.patch(device._id, { mode })
  },
})

// ----------------------------------------------------------------------------
// internal handlers
// todo: move to helpers or some other module

/**
 * Bootstrap a new session for the given device and return the token to send
 * back to the client to authenticate future requests
 */
async function createDeviceSessionAndToken(ctx: MutationCtx, deviceId: Id<'devices'>) {
  const sessionId = await ctx.db.insert('deviceSessions', { deviceId })
  const token = generateDeviceSessionToken()
  await ctx.db.insert('deviceSessionTokens', { token, sessionId })
  return { sessionId, token }
}

async function handleTokenOnRegister(ctx: MutationCtx, sessionToken: string, userId: Id<'users'>) {
  // if we provided a session token we try to get the session. if the session
  // does not exist we can consider this an invalid request and throw an error
  const _session = await helpers.heartbeat.getSessionByToken(ctx, { sessionToken })
  if (!_session) throw new Error('Invalid session token')

  // this allows us to re-register an existing known device that was unregistered before
  // todo: validate ownership and validity of session, otherwise consider it invalid
  // and throw ?
  const existing = await ctx.db.get(_session.deviceId)
  if (!existing) throw new Error('Device not found for the provided session token')

  if (existing.owner !== userId) throw new Error('Device ID already registered to another user')

  // await ctx.runMutation(api.devices.heartbeat.send, { deviceId: existing._id })
  // todo: either accept location data here or extract simple heartbeat call from send
  // to avoid duplicated session validation
  await ctx.runMutation(api.devices.heartbeat.send, { sessionToken })

  return { deviceId: existing._id, sessionToken }
}
