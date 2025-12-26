import { defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Tracks regions (cells) that have been scraped to avoid redundant fetching.
 */
export const scrapedRegions = defineTable({
  geohash: v.string(),
  scrapedAt: v.number(),
  // Can be used to invalidate cache after some time
  expiresAt: v.optional(v.number()),
  // Type of source (e.g., 'osm', 'google', etc.)
  source: v.string(),
  // Categories that were fetched for this cell
  categories: v.array(v.string()),
  // Count of POIs found per category: {categorySlug: count}
  counts: v.optional(v.record(v.string(), v.number())),
  status: v.optional(v.union(v.literal('pending'), v.literal('done'))),
})
  .index('geohash', ['geohash'])
  .index('source_geohash', ['source', 'geohash'])
