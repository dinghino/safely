import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { geospatial } from './poi.location'
import { injectGroups } from './categories'

export type GisMap = Map<Id<'pois'>, { latitude: number; longitude: number }>
type Injected = Awaited<ReturnType<typeof injectGroups>>[number]
export type CategoryMap = Map<Id<'poiCategory'>, NonNullable<Injected>>

type Options = { gisMap: GisMap; categoryMap: CategoryMap }

function ensureOptions(options?: { gisMap?: GisMap; categoryMap?: CategoryMap }): Options {
  const { gisMap = new Map(), categoryMap = new Map() } = options ?? {}
  return { gisMap, categoryMap }
}

/**
 * Inflates a list of POI documents with their coordinates and category data.
 * Optimized with batching to avoid N+1 queries.
 */
export async function inflatePois(ctx: QueryCtx, pois: Doc<'pois'>[], options?: Partial<Options>) {
  if (pois.length === 0) return []
  const { gisMap, categoryMap } = ensureOptions(options)

  // 1. Fetch missing coordinates from geospatial index if not provided
  if (gisMap.size === 0) {
    const gisResults = await Promise.all(pois.map((poi) => geospatial.get(ctx, poi._id)))
    for (const g of gisResults) {
      if (g) gisMap.set(g.key, g.coordinates)
    }
  }

  // 2. Fetch all missing categories
  const neededCategoryIds = Array.from(new Set(pois.map((p) => p.categoryId))).filter(
    (id) => !categoryMap.has(id),
  )
  if (neededCategoryIds.length > 0) {
    const categoriesBase = await Promise.all(
      neededCategoryIds.map((id) => ctx.db.get('poiCategory', id)),
    )
    const validCategories = categoriesBase.filter((c): c is Doc<'poiCategory'> => c !== null)

    // 3. Inject group data into categories (batched)
    const fullyInjectedCategories = await injectGroups(ctx, validCategories)
    for (const c of fullyInjectedCategories) {
      categoryMap.set(c._id, c)
    }
  }

  const authors = await Promise.all(pois.map((poi) => ctx.db.get('users', poi.addedBy)))

  // 3. Assemble final objects
  return pois.map((poi) => {
    const coordinates = gisMap.get(poi._id)!
    const category = categoryMap.get(poi.categoryId)!
    // fixme: extract user data normalization to users lib utils
    const author = authors.find((a) => a?._id === poi.addedBy)
    const addedBy = author
      ? { name: author.name, image: author.image, username: author.username, _id: author._id }
      : null

    return {
      ...poi,
      coordinates,
      category,
      addedBy,
    }
  })
}
