import { query } from './_generated/server'
import { DEFAULT_HEARTBEAT_INTERVAL_MS } from './lib/constants'

export const getAppSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('appSettings').unique()
    return settings
  },
})

export const getDefaultHeartbeat = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('appSettings').unique()
    return settings?.device.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS
  },
})
