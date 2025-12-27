import type { MutationCtx } from '../../_generated/server'
import type { Doc, Id } from '../../_generated/dataModel'
import { type Infer, v } from 'convex/values'
import { point } from '@convex-dev/geospatial'
import * as gis from './poi.location'

export const poiDataValidator = v.object({
  coordinates: point,
  categoryId: v.id('poiCategory'),
  name: v.string(),
  description: v.optional(v.string()),
  attribution: v.optional(v.object({ source: v.string(), url: v.optional(v.string()) })),
  // Add metadata or other fields if needed for scraping matching
  metadata: v.optional(v.any()),
})

export const boundsValidator = v.object({
  sw: v.object({ lat: v.number(), lng: v.number() }),
  ne: v.object({ lat: v.number(), lng: v.number() }),
})

export type PoiData = Infer<typeof poiDataValidator>
export type Bounds = Infer<typeof boundsValidator>

export type CreateOptions = {
  data: PoiData
  user: { _id: Id<'users'> }
  category: Doc<'poiCategory'>
}

export async function createPointOfInterest(ctx: MutationCtx, options: CreateOptions) {
  const { data, user, category } = options

  // 1. Insert into POI table
  const added = await ctx.db.insert('pois', {
    name: data.name,
    description: data.description,
    categoryId: category._id,
    attribution: data.attribution,
    addedBy: user._id,
    sourceData: data.metadata,
  })

  // 2. Insert into Geospatial Index (native Convex index)
  await gis.geospatial.insert(ctx, added, data.coordinates, {
    category: category._id,
    categoryGroup: category.groupId,
  })

  return added
}
