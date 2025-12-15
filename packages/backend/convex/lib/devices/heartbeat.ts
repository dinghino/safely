// device heartbeat functions to keep things tidy

import { api } from '../../_generated/api'
import type { Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { DEFAULT_HEARTBEAT_INTERVAL_MS } from '../constants'

type SessionId = Id<'deviceSessions'>

// region scheduler

/**
 * Schedule a disconnect for the given session with the given token.
 * the schedule is set to run after 2.5x the device expected heartbeat interval
 * @note right now the interval is global, but we will make it configurable per
 * device later. see the todo inside the function and update these docs when done.
 */
export async function scheduleDisconnect(
  ctx: MutationCtx,
  opts: { sessionId: SessionId; sessionToken: string; interval?: number },
) {
  const { sessionId, sessionToken } = opts
  let { interval } = opts

  const entry = await ctx.db.get(sessionId)
  // no session to disconnect
  // todo: graceful no-op or throw?
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
  const device = await ctx.db.get(deviceId)
  if (!device) return DEFAULT_HEARTBEAT_INTERVAL_MS
  const deviceSettings = await ctx.db
    .query('deviceOptions')
    .withIndex('device_mode', (q) => q.eq('deviceId', device._id).eq('mode', device.mode))
    .unique()
  if (!deviceSettings) return DEFAULT_HEARTBEAT_INTERVAL_MS

  return deviceSettings.heartbeat.interval
}

/**
 * Remove any scheduled disconnect for the given session
 * @note this is called when a heartbeat is received to keep the session alive
 */
export async function removeScheduleDisconnect(ctx: MutationCtx, sessionId: SessionId) {
  const existingTimeout = await ctx.db
    .query('deviceSessionTimeouts')
    .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
    .first()
  if (existingTimeout) {
    await ctx.scheduler.cancel(existingTimeout.scheduledFunctionId)
    await ctx.db.delete('deviceSessionTimeouts', existingTimeout._id)
  }
}

// region device sessions

/** retrieve a token record given the token */
async function getSessionTokenRecord(ctx: QueryCtx, options: { sessionToken: string }) {
  const { sessionToken } = options
  return await ctx.db
    .query('deviceSessionTokens')
    .withIndex('token', (q) => q.eq('token', sessionToken))
    .unique()
}

/**
 * get a device session given a session token
 */
export async function getSessionByToken(ctx: QueryCtx, options: { sessionToken?: string }) {
  const { sessionToken } = options
  if (!sessionToken) return null
  const tokenRecord = await getSessionTokenRecord(ctx, { sessionToken })
  if (!tokenRecord) return null
  const session = await ctx.db.get(tokenRecord.sessionId)
  // const session = await getDeviceSession(ctx, tokenRecord.sessionId)
  return session
}

// /** get a session token (string) given a session id */
// export async function getSessionToken(ctx: MutationCtx, options: { sessionId: SessionId }) {
//   const { sessionId } = options
//   const sessionTokenRecord = await ctx.db
//     .query('deviceSessionTokens')
//     .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
//     .unique()
//   if (sessionTokenRecord) {
//     return sessionTokenRecord.token
//   }
//   const sessionToken = generateDeviceSessionToken()
//   await ctx.db.insert('deviceSessionTokens', { sessionId, token: sessionToken })
//   return sessionToken
// }
