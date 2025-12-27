import { v } from 'convex/values'
import { paginationOptsValidator, type PaginationResult } from 'convex/server'

import type { Doc } from '../_generated/dataModel'
import { query } from '../_generated/server'

import { Service as helpers } from '../lib'
import type { CategoryMap, GisMap } from '../lib/pois/poi'

export const one = query({
  args: {
    id: v.id('pois'),
  },
  handler: async (ctx, args) => {
    const { id } = args
    const doc = await ctx.db.get('pois', id)
    if (!doc) {
      throw new Error('POI not found')
    }

    const [category] = await helpers.pois.categories.resolveCategories(ctx, [doc.categoryId])
    const { coordinates } = (await helpers.pois.location.geospatial.get(ctx, id))!

    const gisMap: GisMap = new Map([[id, coordinates]])
    const categoryMap: CategoryMap = new Map([[category!._id, category!]])

    const [item] = await helpers.pois.poi.inflatePois(ctx, [doc], { gisMap, categoryMap })

    return item
  },
})

/**
 * Returns POIs within the given bounding box and categories.
 * @note works in tandem with the {@link ensureCoverage} mutation to fill in our gaps.
 */
export const inView = query({
  args: {
    bounds: helpers.pois.management.boundsValidator,
    categories: v.array(v.id('poiCategory')),
  },
  handler: async (ctx, args) => {
    const { bounds, categories: categoryIds } = args

    // 1. Resolve category slugs
    // resolveCategories handles the empty array case by returning all categories
    const categories = await helpers.pois.categories.resolveCategories(ctx, categoryIds)
    const categorySlugs = categories.map((c) => c.slug)
    const effectiveCategoryIds = categories.map((c) => c._id)

    // console.debug('requesting pois in view', bounds, categorySlugs)

    const missingCells = await helpers.pois.scraper.getMissingCells(ctx, {
      bounds,
      categories: categorySlugs,
    })

    // 2. Return missing cells so client can trigger scraping
    // We cannot schedule actions from a query.
    // The client or a separate process must monitor this field and trigger scraping.

    // 4. Query Geospatial Index
    const { results } = await helpers.pois.location.geospatial.query(ctx, {
      shape: {
        type: 'rectangle',
        rectangle: {
          south: bounds.sw.lat,
          west: bounds.sw.lng,
          north: bounds.ne.lat,
          east: bounds.ne.lng,
        },
      },
      // Filter by specific categories if provided, otherwise show all
      filter: categoryIds.length > 0 ? (q) => q.in('category', effectiveCategoryIds) : undefined,
      limit: 1000,
    })

    const gisMap: GisMap = new Map(results.map((r) => [r.key, r.coordinates]))
    const categoryMap: CategoryMap = new Map(categories.map((c) => [c._id, c]))

    const poiIds = results.map((r) => r.key)
    const _docs = await Promise.all(poiIds.map((id) => ctx.db.get('pois', id)))
    const docs = _docs.filter((doc): doc is Doc<'pois'> => doc !== null)

    const mergedPois = await helpers.pois.poi.inflatePois(ctx, docs, {
      gisMap,
      categoryMap,
    })
    return {
      pois: mergedPois,
      missingCells,
      categorySlugs,
    }
  },
})

/**
 * Returns all POIs regardless of anything.
 * @note this probably breaks due to the high number of documents
 */
export const all = query({
  handler: async (ctx) => {
    const pois = await ctx.db.query('pois').collect()
    return await helpers.pois.poi.inflatePois(ctx, pois)
  },
})

/**
 * List POIs with pagination
 *
 * @param categoryId - Optional category ID to filter by
 * @param paginationOpts - Pagination options
 *
 * @returns Paginated list of POIs with all the data inflated
 */
export const list = query({
  args: {
    categoryId: v.optional(v.id('poiCategory')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let results: PaginationResult<Doc<'pois'>>
    const query = ctx.db.query('pois')
    if (args.categoryId) {
      results = await query
        .withIndex('category', (q) => q.eq('categoryId', args.categoryId!))
        .paginate(args.paginationOpts)
    } else {
      results = await query.paginate(args.paginationOpts)
    }

    const page = await helpers.pois.poi.inflatePois(ctx, results.page)

    return {
      ...results,
      page,
    }
  },
})

export const scrapedCells = query({
  args: {
    bounds: helpers.pois.management.boundsValidator,
  },
  handler: async (ctx, args) => {
    const { bounds } = args

    // Optimization: Only fetch cells currently in view to avoid full table scans
    // We use the same precision as the scraper to find matching records.
    const SCRAPING_PRECISION = 5 // must match the one in lib/pois/scraping.ts
    const viewportCells = helpers.geohash.bboxes(bounds, SCRAPING_PRECISION)

    // Limit to avoid excessive parallel queries if viewport is huge
    const cellsToQuery = viewportCells.slice(0, 100)

    const cellDocs = await Promise.all(
      cellsToQuery.map((cell) =>
        ctx.db
          .query('scrapedRegions')
          .withIndex('geohash', (q) => q.eq('geohash', cell))
          .unique(),
      ),
    )

    return cellDocs
      .filter((cell): cell is NonNullable<typeof cell> => cell !== null)
      .map((cell) => ({
        ...cell,
        bbox: helpers.geohash.decode_bbox(cell.geohash),
      }))
  },
})
