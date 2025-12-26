import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { geohash } from '../geohash'

import type { Bounds } from './management'

const SCRAPING_PRECISION = 5 // ~4.9km x 4.9km

export type PlannerParams = {
  bounds: Bounds
  categories: string[]
}

/**
 * Calculates which geohash cells within a bounding box need scraping.
 * Checks against the scrapedRegions table to filter out recently processed cells.
 */
export async function getMissingCells(ctx: QueryCtx, params: PlannerParams): Promise<string[]> {
  const { bounds, categories } = params

  // 1. Calculate all cells within bbox at scraping precision
  const cells = geohash.bboxes(bounds, SCRAPING_PRECISION)

  // Optimization: If too many cells (e.g. huge bbox), we prevent scraping to avoid overloading.
  // Precision 5 is ~5km x 5km. 50 cells covers ~1250 sq km.
  if (cells.length > 128) {
    console.warn(`Viewport too large for scraping (${cells.length} cells). Skipping JIT.`)
    return []
  }

  // 2. Query scrapedRegions for these cells
  // We can't do a massive "in" query efficiently if there are many cells.
  // But likely for a viewport it's < 50 cells.
  // Filter approach:
  const scraped = await ctx.db
    .query('scrapedRegions')
    .filter((q) => q.or(...cells.map((cell) => q.eq(q.field('geohash'), cell))))
    .collect()

  // 3. Filter to only missing/stale/incomplete cells
  const now = Date.now()
  const scrapedSet = new Set(
    scraped
      .filter((r) => {
        // 1. Handle Pending
        if (r.status === 'pending') {
          // If pending for too long (e.g. 10 mins), consider it stale and allow re-scrape
          const isStalePending = r.scrapedAt && now - r.scrapedAt > 1000 * 60 * 10
          return !isStalePending
        }

        // 2. Handle Done
        // Must check if it contains ALL requested categories
        const hasCategories = categories.every((cat) => r.categories.includes(cat))

        // Check expiration
        const isFresh = r.expiresAt ? r.expiresAt > now : true // Assume fresh if no expiry

        return hasCategories && isFresh
      })
      .map((r) => r.geohash),
  )

  return cells.filter((c) => !scrapedSet.has(c))
}

export function getNeighbors(cellHash: string): string[] {
  return geohash.neighbors(cellHash)
}

/**
 * Initializes a set of geohash cells as 'pending' in the database.
 * If a cell already exists and is not 'pending', it marks it as 'pending'
 * and merges the categories.
 */
export async function initializePendingCells(
  ctx: MutationCtx,
  args: { cells: string[]; categories: string[] },
) {
  const { cells, categories } = args
  const now = Date.now()

  for (const cell of cells) {
    const existing = await ctx.db
      .query('scrapedRegions')
      .withIndex('geohash', (q) => q.eq('geohash', cell))
      .first()

    if (existing) {
      if (existing.status === 'pending') continue

      await ctx.db.patch(existing._id, {
        status: 'pending',
        categories: Array.from(new Set([...existing.categories, ...categories])),
        scrapedAt: now,
      })
    } else {
      await ctx.db.insert('scrapedRegions', {
        geohash: cell,
        status: 'pending',
        categories,
        scrapedAt: now,
        source: 'osm',
      })
    }
  }
}
