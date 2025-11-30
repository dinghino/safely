import { v } from 'convex/values'
import { internalMutation, query, type QueryCtx } from '../_generated/server'
import { deviceActivityEvent, type DeviceActivityLog } from '../schemas/device-activities.schema'
import { isCurrentUserOwner } from '../lib/devices'
import type { Doc } from '../_generated/dataModel'

export const add = internalMutation({
  args: {
    data: deviceActivityEvent,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('deviceActivitiesLog', { ...args.data })
  },
})

export const getAll = query({
  args: {
    deviceId: v.id('devices'),
    // type: v.optional(v.array(deviceActivityType)),
  },
  handler: async (ctx, args) => {
    // verify ownership
    const device = await ctx.db.get(args.deviceId)
    if (!device || !(await isCurrentUserOwner({ ctx, device }))) {
      throw new Error('Device not found')
    }
    const data = await ctx.db
      .query('deviceActivitiesLog')
      .withIndex('device', (q) => q.eq('deviceId', args.deviceId))
      .order('desc')
      .collect()

    return await Promise.all(data.map((item) => processActivityLog({ ctx, item })))
  },
})

/**
 * Process a device activity log entry to enrich its data from other tables
 */
async function processActivityLog(options: { ctx: QueryCtx; item: Doc<'deviceActivitiesLog'> }) {
  const { ctx, item } = options
  // these are separated to keep type inference correct down the chain (client)
  // otherwise they get mixed up
  if (item.type === 'shared' || item.type === 'unshared') {
    const users = await getUsersData(ctx, item)
    return { ...item, payload: { ...item.payload, users } }
  }
  if (item.type === 'session_shared') {
    const users = await getUsersData(ctx, item)
    return { ...item, payload: { ...item.payload, users } }
  }
  // todo: add ownership changed user data

  return item
}

async function getUsersData(
  ctx: QueryCtx,
  item: DeviceActivityLog<'shared' | 'unshared' | 'session_shared'>,
) {
  const data = await Promise.all(item.payload.users.map((userId) => ctx.db.get(userId)))
  return data.filter((u) => !!u).map(({ _id, username, image }) => ({ _id, username, image }))
}
