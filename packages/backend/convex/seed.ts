/**
 * Seed data mutations
 * These are run manually as needed to populate or update data
 * in the database.
 *
 * Actual seeders are in the `seeds/` folder and should be helper functions
 * that take in a `MutationCtx` and perform the necessary operations.
 * ----------------------------------------------------------------------------
 * biome-ignore-all lint/correctness/noUnusedVariables: seed functions might be unused temporarily
 */

import { internalMutation } from './_generated/server'
import * as devices from './seeds/devices'
import * as poiCategories from './seeds/poi_categories'

/**
 * This mutation can be used to run momentary code to update or fix data
 * in the database. It is not exposed in the API and can only be run manually
 * by a developer.
 */
export const updates = internalMutation({
  handler: async (ctx) => {
    await devices.populateOptions(ctx)
  },
})

/**
 * Default mutation run with `convex run seed`.
 * This should be run once to set up the environment or to reset it to a
 * known good state.
 */
const all = internalMutation({
  args: {},
  handler: async (ctx) => {
    await Promise.all([devices.createOptions(ctx), poiCategories.seedPoiCategories(ctx)])
  },
})

export default all

// ----------------------------------------------------------------------------
// seed mutations
// Domain specific seed mutations that can also be run manually
// ----------------------------------------------------------------------------

export const deviceOnly = internalMutation({
  handler: async (ctx) => await devices.createOptions(ctx),
})

export const poiCategoriesOnly = internalMutation({
  handler: async (ctx) => await poiCategories.seedPoiCategories(ctx),
})
