// device heartbeat functions to keep things tidy

import { api } from '../../_generated/api'
import type { MutationCtx, QueryCtx } from '../../_generated/server'

// helpers

export async function scheduleDisconnect(
  ctx: MutationCtx,
  opts: { sessionId: string; sessionToken: string },
) {
  const { sessionId, sessionToken } = opts
  const appSettings = await ctx.db.query('appSettings').unique()
  const intervalMs = appSettings?.device.heartbeatIntervalMs ?? 10_000
  const timeout = await ctx.scheduler.runAfter(intervalMs * 2.5, api.devices.disconnect, {
    sessionToken,
  })
  await ctx.db.insert('deviceSessionTimeouts', { sessionId, scheduledFunctionId: timeout })
}

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
