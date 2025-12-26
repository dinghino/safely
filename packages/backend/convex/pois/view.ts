import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { Service as helpers } from '../lib'

/**
 * Ensures that the given viewport is covered by scraped data.
 * This is a fire-and-forget trigger intended to be called by the client
 * when the map view changes.
 */
export const ensureCoverage = mutation({
  args: {
    bounds: helpers.pois.management.boundsValidator,
    categories: v.array(v.id('poiCategory')),
  },
  handler: async (ctx, args) => {
    const { bounds, categories: categoryIds } = args

    // 1. Resolve category slugs (similar logic to get.inView)
    const categories = await helpers.pois.categories.resolveCategories(ctx, categoryIds)
    const categorySlugs = categories.map((c) => c.slug)

    // 2. Check for missing cells
    const missingCells = await helpers.pois.scraper.getMissingCells(ctx, {
      bounds,
      categories: categorySlugs,
    })

    // 3. Schedule scraping if needed
    if (missingCells.length > 0) {
      // Mark as pending IMMEDIATELY so other calls don't trigger it
      await helpers.pois.scraper.initializePendingCells(ctx, {
        cells: missingCells,
        categories: categorySlugs,
      })

      await ctx.scheduler.runAfter(0, internal.pois.scraping.scrapeCells, {
        cells: missingCells,
        categories: categorySlugs,
      })
      return { status: 'queued', missingCells: missingCells.length }
    }

    return { status: 'ok', missingCells: 0 }
  },
})
