// device heartbeat functions to keep things tidy

import { api } from '../../_generated/api'
import type { Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { DEFAULT_HEARTBEAT_INTERVAL_MS } from '../constants'

// helpers

/**
 * Schedule a disconnect for the given session with the given token.
 * the schedule is set to run after 2.5x the device expected heartbeat interval
 * @note right now the interval is global, but we will make it configurable per
 * device later. see the todo inside the function and update these docs when done.
 */
export async function scheduleDisconnect(
  ctx: MutationCtx,
  opts: { sessionId: string; sessionToken: string; interval?: number },
) {
  const { sessionId, sessionToken } = opts
  let { interval } = opts

  const entry = await getDeviceSession(ctx, sessionId)
  // no session to disconnect
  if (!entry) throw new Error('no session found to schedule disconnect')

  interval = await getHeartbeatInterval(ctx, { interval, deviceId: entry.deviceId })

  const timeout = await ctx.scheduler.runAfter(interval * 2.5, api.devices.heartbeat.disconnect, {
    sessionToken,
  })
  await ctx.db.insert('deviceSessionTimeouts', { sessionId, scheduledFunctionId: timeout })
}

/**
 * get the heartbeat interval for the given device, cascading down to available
 * options, in order to set up automatic disconnects
 */
async function getHeartbeatInterval(
  ctx: QueryCtx,
  params: { interval?: number; deviceId: Id<'devices'> },
) {
  const { interval, deviceId } = params
  if (interval) return interval
  const deviceSettings = await ctx.db
    .query('deviceOptions')
    .withIndex('device_mode', (q) => q.eq('deviceId', deviceId))
    .unique()
  if (!deviceSettings) return DEFAULT_HEARTBEAT_INTERVAL_MS
  // const appSettings = await ctx.db.query('appSettings').unique()
  // if (appSettings?.device.heartbeat.interval) return appSettings.device.heartbeat.interval

  return deviceSettings.heartbeat.interval
}

/**
 * Remove any scheduled disconnect for the given session
 * @note this is called when a heartbeat is received to keep the session alive
 */
export async function removeScheduleDisconnect(ctx: MutationCtx, sessionId: string) {
  const existingTimeout = await ctx.db
    .query('deviceSessionTimeouts')
    .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
    .first()
  if (existingTimeout) {
    await ctx.scheduler.cancel(existingTimeout.scheduledFunctionId)
    await ctx.db.delete(existingTimeout._id)
  }
}

/** retrieve a token record given the token */
export async function getSessionTokenRecord(ctx: QueryCtx, options: { sessionToken: string }) {
  const { sessionToken } = options
  return await ctx.db
    .query('deviceSessionTokens')
    .withIndex('token', (q) => q.eq('token', sessionToken))
    .unique()
}
export async function getDeviceSession(ctx: QueryCtx, sessionId: string) {
  return await ctx.db
    .query('deviceSessions')
    .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
    .unique()
}
/** get a session token (string) given a session id */
export async function getSessionToken(ctx: MutationCtx, options: { sessionId: string }) {
  const { sessionId } = options
  const sessionTokenRecord = await ctx.db
    .query('deviceSessionTokens')
    .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
    .unique()
  if (sessionTokenRecord) {
    return sessionTokenRecord.token
  }
  const sessionToken = crypto.randomUUID()
  await ctx.db.insert('deviceSessionTokens', { sessionId, token: sessionToken })
  return sessionToken
}
