import { query } from '../_generated/server'
import { v } from 'convex/values'
import { Service as helpers } from '../lib'

/**
 * Returns POIs within the given bounding box and categories.
 * Side effect: Schedules a background action to scrape missing cells if needed.
 */
export const inView = query({
  args: {
    bounds: helpers.pois.management.boundsValidator,
    categories: v.array(v.id('poiCategory')),
  },
  handler: async (ctx, args) => {
    const { bounds, categories: categoryIds } = args

    // 1. Calculate which cells need scraping
    const categories = await helpers.pois.categories.resolveCategories(ctx, categoryIds)
    const categorySlugs = categories.map((c) => c.slug)
    console.log('requesting pois in view', bounds, categorySlugs)

    const missingCells = await helpers.pois.scraper.getMissingCells(ctx, {
      bounds,
      categories: categorySlugs,
    })

    // 2. Return missing cells so client can trigger scraping
    // We cannot schedule actions from a query.
    // The client or a separate process must monitor this field and trigger scraping.

    if (categoryIds.length === 0) {
      return { pois: [], missingCells }
    }

    // 4. Query Geospatial Index
    console.log('querying geospatial index', bounds, categoryIds)
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
      // Filter by category IDs using the auxiliary index field
      filter: (q) => q.in('category', categoryIds),
      limit: 1000, // Reasonable cap for viewport
    })

    // 5. Fetch full documents and merge with coordinates from index
    // The geospatial query returns { key: Id, coordinates: Point }
    const indexResultsMap = new Map(results.map((r) => [r.key, r.coordinates]))
    const poiIds = results.map((r) => r.key)

    const docs = await Promise.all(poiIds.map((id) => ctx.db.get(id)))

    const mergedPois = docs
      .filter((doc) => doc !== null)
      .filter((doc) => categoryIds.includes(doc.categoryId))
      .map((doc) => ({
        ...doc,
        coordinates: indexResultsMap.get(doc._id)!, // Merge coordinates from index
      }))

    return {
      pois: mergedPois,
      missingCells,
      categorySlugs,
    }
  },
})

export const all = query({
  handler: async (ctx) => {
    const pois = await ctx.db.query('pois').collect()
    const gis = await Promise.all(
      pois.map((poi) => helpers.pois.location.geospatial.get(ctx, poi._id)),
    )
    const map = new Map(gis.filter((g) => g !== null).map((g) => [g.key, g.coordinates]))
    return pois.map((poi) => ({ ...poi, coordinates: map.get(poi._id) }))
  },
})
