import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'
import { mutation } from '../_generated/server'

import { locationMetadata } from '../schemas/shared'

import { helpers } from '../lib/devices'
import { api, internal } from '../_generated/api'
import { _getActiveSession, addLocationPoint } from '../tracking/lib'
import { createActivityLog } from '../lib/devices/logs'

// region heartbeat.send

export const send = mutation({
  args: {
    sessionToken: v.string(),
    interval: v.optional(v.number()),
    location: v.optional(
      v.object({
        point: point,
        metadata: v.optional(locationMetadata),
      }),
    ),
  },
  returns: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionToken, location, interval } = args

    if (!sessionToken) {
      throw new Error('Unathorized')
    }

    // ------------------------------------------------------------------------
    // session lookup and ownership extraction
    // we removed the ownership check on users since
    //  1. devices could be IoT and not linked to users directly
    //  2. we want to allow device sessions to be independent of users
    // authorization and validation is done through session tokens and
    // (in the future) either/or api keys or hmac signatures on payloads

    const session = await helpers.heartbeat.getSessionByToken(ctx, { sessionToken })
    if (!session) {
      throw new Error('Invalid session token')
    }
    const sessionId = session._id
    const deviceId = session.deviceId

    // ownership check -----------------------------------

    await helpers.heartbeat.removeScheduleDisconnect(ctx, session._id)

    ///
    ///

    const device = await helpers.get.deviceById(ctx, deviceId)
    // used to ping events and other internal logic
    if (device.status === 'offline') {
      await ctx.runMutation(internal.devices.activities.add, {
        data: createActivityLog({ deviceId, type: 'connected', payload: {} }),
      })
    }
    // update device data - we do not update user since devices could be IoT
    // to update other entities we need some discriminator on the devices

    const last_seen = Date.now()
    await ctx.db.patch('devices', deviceId, { last_seen, status: 'online' })

    // handle location data if provided by dispatching a last known location update.
    //
    if (location) {
      await ctx.runMutation(api.devices.location.setLast, { deviceId, ...location })
      // fixme: getActive uses user auth and will fail when we only have device session tokens
      const activeSession = await _getActiveSession({ ctx, deviceId })
      if (activeSession) {
        await addLocationPoint({ ctx, session: activeSession, data: location })
      }
    }

    ///
    ///

    // Get or generate token to disconnect session.
    // const sessionToken = await helpers.heartbeat.getSessionToken(ctx, { sessionId })

    // Schedule timeout to disconnect this session if no heartbeat is received
    // todo: chain scheduled with some `idle` function before full disconnect
    // if we want to implement idle states
    await helpers.heartbeat.scheduleDisconnect(ctx, { sessionId, sessionToken, interval })
    return { sessionToken }
  },
})

// endregion

// region heartbeat.disconnect

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const { sessionToken } = args
    const session = await helpers.heartbeat.getSessionByToken(ctx, { sessionToken })
    // todo: handle invalid or missing token
    if (!session) return console.error('Session not found for token', sessionToken)

    const sessionId = session._id

    const device = await helpers.get.deviceById(ctx, session.deviceId)
    if (device.status === 'online') {
      await ctx.runMutation(internal.devices.activities.add, {
        data: createActivityLog({ deviceId: device._id, type: 'disconnected', payload: {} }),
      })
    }
    await ctx.db.patch('devices', device._id, { status: 'offline' })
    await helpers.heartbeat.removeScheduleDisconnect(ctx, sessionId)
  },
})
// // endregion
