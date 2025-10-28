import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'
import { mutation } from '../_generated/server'

import { locationMetadata } from '../schemas/shared'

import { getCurrentUserOrThrow } from '../lib/auth'

import { helpers } from '../lib/devices'
import { api } from '../_generated/api'

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
    console.log('Heartbeat received for session token:', sessionToken)
    const session = await helpers.heartbeat.getSessionByToken(ctx, { sessionToken })
    console.log('Resolved session:', session)
    if (!session) {
      throw new Error('Invalid session token')
    }
    const sessionId = session._id
    const deviceId = session.deviceId

    // ownership check -----------------------------------

    // fixme: we cannot be sure that we have a user in our context here
    // since we are refactoring with device sessions not linked to users directly
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, deviceId)
    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }

    await helpers.heartbeat.removeScheduleDisconnect(ctx, session._id)

    ///
    ///

    // update device data - we do not update user since devices could be IoT
    // to update other entities we need some discriminator on the devices

    const last_seen = Date.now()
    await ctx.db.patch(deviceId, { last_seen, status: 'online' })

    // handle location data if provided by dispatching a last known location update.
    //
    if (location) {
      await ctx.runMutation(api.devices.location.setLast, { deviceId, ...location })
      const tracking = await ctx.runQuery(api.tracking.sessions.getActive, { deviceId })
      if (tracking) {
        await ctx.runMutation(api.tracking.locations.add, { sessionId: tracking._id, ...location })
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

// region old heartbeat.send

// export const user_send = mutation({
//   args: {
//     deviceId: v.id('devices'),
//     interval: v.optional(v.number()),
//     location: v.optional(
//       v.object({
//         point: point,
//         metadata: v.optional(locationMetadata),
//       }),
//     ),
//   },
//   returns: {
//     sessionToken: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const { deviceId, location, interval } = args

//     // ownership check -----------------------------------

//     const user = await getCurrentUserOrThrow(ctx)
//     const device = await helpers.get.deviceById(ctx, deviceId)
//     if (device.owner !== user._id) {
//       throw new Error('You do not own this device')
//     }

//     // update or create session - single session per device
//     let sessionId: string
//     const session = await ctx.db
//       .query('deviceSessions')
//       .withIndex('deviceId', (q) => q.eq('deviceId', deviceId))
//       .unique()

//     if (session) {
//       sessionId = session.sessionId
//     } else {
//       sessionId = generateDeviceSessionToken()
//       await ctx.db.insert('deviceSessions', { deviceId, sessionId })
//     }

//     await helpers.heartbeat.removeScheduleDisconnect(ctx, sessionId)

//     ///
//     ///

//     // update device data - we do not update user since devices could be IoT
//     // to update other entities we need some discriminator on the devices

//     const last_seen = Date.now()
//     await ctx.db.patch(deviceId, { last_seen, status: 'online' })

//     // handle location data if provided by dispatching a last known location update.
//     //
//     if (location) {
//       await ctx.runMutation(api.devices.location.setLast, { deviceId, ...location })
//       const tracking = await ctx.runQuery(api.tracking.sessions.getActive, { deviceId })
//       if (tracking) {
//         await ctx.runMutation(api.tracking.locations.add, { sessionId: tracking._id, ...location })
//       }
//     }

//     ///
//     ///

//     // Get or generate token to disconnect session.
//     const sessionToken = await helpers.heartbeat.getSessionToken(ctx, { sessionId })

//     // Schedule timeout to disconnect this session if no heartbeat is received
//     // todo: chain scheduled with some `idle` function before full disconnect
//     // if we want to implement idle states
//     await helpers.heartbeat.scheduleDisconnect(ctx, { sessionId, sessionToken, interval })
//     return { sessionToken }
//   },
// })

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
    await ctx.db.patch(device._id, { status: 'offline' })
    await helpers.heartbeat.removeScheduleDisconnect(ctx, sessionId)
  },
})
// // endregion
