/**
 * Utility module to get a clean slate of ALL our POIs and scraped regions.
 * @note This is a system-level operation and should be used with caution.
 *       It will delete all POIs and scraped regions in batches of `numItems`.
 *
 * @usage You can use either
 * - `cleanupScrapedData` mutation to delete EVERYTHING or
 *
 * - `deletePois` to remove all the points of interest and related GIS information
 * - `deleteRegions` to remove all the scraped regions without touching the points of interest
 *
 * @note due geospatial info size, a good batch size is around 100-200 items, otherwise we risk
 * hitting convex query limits and error out.
 */
import { internalMutation, type MutationCtx } from '../_generated/server'
import { v } from 'convex/values'
import { Service } from '../lib'
import { internal } from '../_generated/api'

const DEFAULT_BATCH_SIZE = 150

function getBatchSize(args: { numItems?: number }) {
  return args.numItems ?? DEFAULT_BATCH_SIZE
}

export const cleanupScrapedData = internalMutation({
  args: {
    numItems: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numItems = getBatchSize(args)
    console.log(`Starting system cleanup with batch size ${numItems}...`)

    console.log('Deleting POIs...')
    await ctx.runMutation(internal.pois.management.deletePois, { numItems, cursor: null })
    console.log('Deleting Scraped Regions...')
    await ctx.runMutation(internal.pois.management.deleteRegions, { numItems, cursor: null })

    console.log('System cleared successfully.')
  },
})

export const deletePois = internalMutation({
  args: {
    numItems: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    page: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const numItems = getBatchSize(args)
    console.log(`Deleting POIs page ${args.page ?? 0} with ${numItems} per page...`)

    const { page, isDone, continueCursor } = await ctx.db
      .query('pois')
      .paginate({ cursor: args.cursor, numItems })

    for (const poi of page) {
      await Service.pois.location.geospatial.remove(ctx, poi._id)
    }

    await Promise.all(page.map((p) => ctx.db.delete(p._id)))

    if (!isDone) {
      console.log('continuing...')
      await ctx.scheduler.runAfter(0, internal.pois.management.deletePois, {
        numItems,
        cursor: continueCursor,
        page: (args.page ?? 0) + 1,
      })
    }
  },
})

export const deleteRegions = internalMutation({
  args: {
    numItems: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const numItems = getBatchSize(args)

    const { page, isDone, continueCursor } = await ctx.db
      .query('scrapedRegions')
      .paginate({ cursor: args.cursor, numItems })

    await Promise.all(page.map((r) => ctx.db.delete(r._id)))

    if (!isDone) {
      await ctx.scheduler.runAfter(0, internal.pois.management.deleteRegions, {
        numItems,
        cursor: continueCursor,
      })
    }
  },
})
