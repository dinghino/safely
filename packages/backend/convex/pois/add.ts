import { mutation, type QueryCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { v } from 'convex/values'

import * as helpers from '../lib/pois'
import { Service } from '../lib'

async function getCategory(ctx: QueryCtx, categoryId: Id<'poiCategory'>) {
  const category = await ctx.db.get('poiCategory', categoryId)
  if (!category) {
    throw new Error(`Category with ID ${categoryId} not found`)
  }
  return category
}

export const one = mutation({
  args: {
    data: helpers.management.poiDataValidator,
  },
  handler: async (ctx, args) => {
    const { data } = args
    const { categoryId } = data

    const user = await Service.auth.getCurrentUserOrThrow(ctx)

    const category = await getCategory(ctx, categoryId)
    return await helpers.management.createPointOfInterest(ctx, { data, user, category })
  },
})

export const many = mutation({
  args: {
    data: v.array(helpers.management.poiDataValidator),
  },
  handler: async (ctx, args) => {
    const { data } = args
    const user = await Service.auth.getCurrentUserOrThrow(ctx)

    const categoryGrouped = new Map<Id<'poiCategory'>, helpers.management.PoiData[]>()
    for (const poi of data) {
      const arr = categoryGrouped.get(poi.categoryId) || []
      arr.push(poi)
      categoryGrouped.set(poi.categoryId, arr)
    }
    for (const [categoryId, pois] of categoryGrouped.entries()) {
      const category = await getCategory(ctx, categoryId)
      for (const poi of pois) {
        await helpers.management.createPointOfInterest(ctx, { data: poi, user, category })
      }
    }
  },
})
