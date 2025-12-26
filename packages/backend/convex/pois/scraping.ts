import {
  internalAction,
  internalMutation,
  internalQuery,
  type ActionCtx,
} from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { geohash } from '../lib/geohash'
import { createFetcher, type POIFetcher } from '@workspace/poi-seeder'
import { DtoMapper } from '@workspace/poi-seeder/mapper'
import { Service as helpers } from '../lib'

const SCRAPE_PRECISION = 5 // ~4.9km x 4.9km

export const scrapeCells = internalAction({
  args: {
    cells: v.array(v.string()), // Geohashes at precision 6
    categories: v.array(v.string()),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { cells, categories, force } = args

    // Create fetcher and mapper once
    const fetcher = createFetcher({ type: 'osm' })
    const mapper = new DtoMapper()

    // Process sequentially to avoid rate limits (429)
    for (const cellHash of cells) {
      await processCell(ctx, cellHash, categories, fetcher, mapper, force)
      // Small delay to be nice to Overpass
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  },
})

export const scrapeBoundingBox = internalAction({
  args: {
    bounds: helpers.pois.management.boundsValidator,
    categories: v.array(v.string()), // slugs
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { bounds, categories, force } = args

    // 1. Calculate cells
    // todo: normalize bbox API to be cleaner. choose one format for all our APIs
    const cells = geohash.bboxes(bounds, SCRAPE_PRECISION)

    console.log(`Manual scrape: ${cells.length} cells`, { categories, force })

    // 2. Reuse shared fetcher/mapper setup
    const fetcher = createFetcher({ type: 'osm' })
    const mapper = new DtoMapper()

    // 3. Process sequentially (to avoid 429 and 400 from concurrency)
    for (const cellHash of cells) {
      await processCell(ctx, cellHash, categories, fetcher, mapper, force)
      // 1s delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  },
})
// --- Internal API ---

/**
 * Checks if a geohash cell has been recently scraped.
 *
 * This function queries the 'scrapedRegions' table to determine if a valid,
 * non-expired scrape record exists for the given geohash. It also verifies
 * that the scrape record covers all requested categories.
 *
 * @param ctx - The query context.
 * @param args - Object containing:
 *   - geohash: The geohash string to check (precision 6).
 *   - categories: Array of category slugs required.
 * @returns boolean - True if the cell is recently scraped and covers all categories, false otherwise.
 */
export const checkScraped = internalQuery({
  args: {
    geohash: v.string(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Find a recent scrape for this geohash
    const scraped = await ctx.db
      .query('scrapedRegions')
      .withIndex('geohash', (q) => q.eq('geohash', args.geohash))
      .order('desc')
      .first()

    if (!scraped || scraped.status !== 'done') return false

    // Check expiration
    if (scraped.expiresAt && scraped.expiresAt < Date.now()) {
      return false
    }

    // Check if all requested categories were covered
    const covered = args.categories.every((c) => scraped.categories.includes(c))
    return covered
  },
})

export const initializePendingCells = internalMutation({
  args: {
    cells: v.array(v.string()),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await helpers.pois.scraper.initializePendingCells(ctx, args)
  },
})

export const saveScrapedData = internalMutation({
  args: {
    geohash: v.string(),
    source: v.string(),
    categories: v.array(v.string()),
    pois: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        categorySlug: v.string(),
        coordinates: v.object({ lat: v.number(), lng: v.number() }),
        metadata: v.optional(v.any()),
        attribution: v.optional(v.object({ source: v.string(), url: v.optional(v.string()) })),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { pois, geohash: cellHash, source, categories } = args

    const allCategories = await ctx.db.query('poiCategory').collect()
    const catMap = new Map(allCategories.map((c) => [c.slug, c]))

    // Get the system user responsible for seeding
    const systemUser = await helpers.users.getSeederUser(ctx)

    // Parallel insertion with count tracking
    const insertResults = await Promise.all(
      pois.map(async (poiData) => {
        const category = catMap.get(poiData.categorySlug)
        if (!category) {
          console.warn(`Category slug not found: ${poiData.categorySlug}`)
          return { success: false, categorySlug: poiData.categorySlug }
        }

        await helpers.pois.management.createPointOfInterest(ctx, {
          data: {
            ...poiData,
            categoryId: category._id,
            coordinates: { latitude: poiData.coordinates.lat, longitude: poiData.coordinates.lng },
          },
          user: systemUser,
          category: category,
        })
        return { success: true, categorySlug: poiData.categorySlug }
      }),
    )

    // Compute counts per category
    const counts: Record<string, number> = {}
    for (const result of insertResults) {
      if (result.success) {
        counts[result.categorySlug] = (counts[result.categorySlug] || 0) + 1
      }
    }

    // Mark region as scraped
    const existing = await ctx.db
      .query('scrapedRegions')
      .withIndex('geohash', (q) => q.eq('geohash', cellHash))
      .first()

    if (existing) {
      const mergedCounts = { ...(existing.counts || {}) }
      for (const [slug, count] of Object.entries(counts)) {
        mergedCounts[slug] = (mergedCounts[slug] || 0) + count
      }

      await ctx.db.patch(existing._id, {
        source,
        categories: Array.from(new Set([...existing.categories, ...categories])),
        scrapedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
        counts: mergedCounts,
        status: 'done',
      })
    } else {
      await ctx.db.insert('scrapedRegions', {
        geohash: cellHash,
        source,
        categories,
        scrapedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
        counts,
        status: 'done',
      })
    }
  },
})

// --- Helpers ---

/**
 * Helper to process a single cell: check, fetch, map, and save.
 */
async function processCell(
  ctx: ActionCtx,
  cellHash: string,
  categories: string[],
  fetcher: POIFetcher, // Type from poi-seeder
  mapper: DtoMapper,
  force?: boolean,
) {
  try {
    // 1. Check if already scraped
    const isScraped = await ctx.runQuery(internal.pois.scraping.checkScraped, {
      geohash: cellHash,
      categories,
    })

    if (isScraped && !force) {
      return
    }

    // 2. Fetch from OSM
    const boundingBox = geohash.decode_bbox(cellHash)
    const rawPois = await fetcher.fetch({ boundingBox, categories })

    // 3. Handle empty results
    if (rawPois.length === 0) {
      await ctx.runMutation(internal.pois.scraping.saveScrapedData, {
        geohash: cellHash,
        source: 'osm',
        pois: [],
        categories,
      })
      return
    }

    // 4. Map and Save
    const pois = mapper.batchImportDto(rawPois, categories)
    await ctx.runMutation(internal.pois.scraping.saveScrapedData, {
      geohash: cellHash,
      source: 'osm',
      pois,
      categories,
    })
  } catch (err) {
    console.error(`Failed to scrape cell ${cellHash}:`, err)
  }
}
