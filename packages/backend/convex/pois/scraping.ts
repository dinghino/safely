import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { geohash } from '../lib/geohash'
import { createFetcher } from '@workspace/poi-seeder'
import { DtoMapper } from '@workspace/poi-seeder/mapper'
import * as helpers from '../lib/pois'

const SCRAPE_PRECISION = 6 // ~600m x 1.2km

export const fetchFromSource = internalAction({
  args: {
    lat: v.number(),
    lng: v.number(),
    categories: v.array(v.string()), // Slugs
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { lat, lng, categories, force } = args

    // 1. Calculate geohash for the target location
    const centerHash = geohash.encode(lat, lng, SCRAPE_PRECISION)

    // 2. Process cell
    const cellHash = centerHash

    // 3. Check if already scraped
    const isScraped = await ctx.runQuery(internal.pois.scraping.checkScraped, {
      geohash: cellHash,
      categories,
    })

    if (isScraped && !force) {
      console.log(`Skipping ${cellHash}, already scraped.`)
      return
    }

    // 4. Fetch from Source
    const bbox = geohash.decode_bbox(cellHash)
    const fetcher = createFetcher({ type: 'osm' })

    console.log(`Fetching ${cellHash} from OSM...`)

    const rawPois = await fetcher.fetch({
      boundingBox: bbox,
      categories: categories,
    })

    if (rawPois.length === 0) {
      await ctx.runMutation(internal.pois.scraping.saveScrapedData, {
        pois: [],
        geohash: cellHash,
        source: 'osm',
        categories,
      })
      return
    }

    // 5. Map to DTO
    const mapper = new DtoMapper()
    const importDtos = mapper.batchImportDto(rawPois, categories)

    // 6. Save to DB
    await ctx.runMutation(internal.pois.scraping.saveScrapedData, {
      pois: importDtos.map((d) => ({
        name: d.name,
        description: d.description,
        categorySlug: d.categorySlug,
        coordinates: d.coordinates,
        metadata: d.metadata,
        attribution: d.attribution,
      })),
      geohash: cellHash,
      source: 'osm',
      categories,
    })
  },
})

// --- Internal API ---

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

    if (!scraped) return false

    // Check expiration
    if (scraped.expiresAt && scraped.expiresAt < Date.now()) {
      return false
    }

    // Check if all requested categories were covered
    const covered = args.categories.every((c) => scraped.categories.includes(c))
    return covered
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

    const systemUser = await ctx.db.query('users').first()
    if (!systemUser) {
      console.warn('No users found to attribute POIs to. Skipping save.')
      return
    }

    // Parallel insertion with count tracking
    const insertResults = await Promise.all(
      pois.map(async (poiData) => {
        const category = catMap.get(poiData.categorySlug)
        if (!category) {
          console.warn(`Category slug not found: ${poiData.categorySlug}`)
          return { success: false, categorySlug: poiData.categorySlug }
        }
        const { lat: latitude, lng: longitude } = poiData.coordinates
        await helpers.management.createPointOfInterest(ctx, {
          data: {
            name: poiData.name,
            description: poiData.description,
            categoryId: category._id,
            coordinates: { latitude, longitude },
            attribution: poiData.attribution,
            metadata: poiData.metadata,
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
    await ctx.db.insert('scrapedRegions', {
      geohash: cellHash,
      source,
      categories,
      scrapedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
      counts,
    })
  },
})
