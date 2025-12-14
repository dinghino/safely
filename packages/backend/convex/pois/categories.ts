import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { injectGroupData, injectInPaginated } from '../lib/pois/categories'

export const addCategory = mutation({
  args: {},
  handler: async (_ctx) => {
    throw new Error('Not implemented yet. admin only operation.')
  },
})

export const editCategory = mutation({
  args: {
    id: v.id('poiCategory'),
  },
  handler: async (_ctx) => {
    throw new Error('Not implemented yet. admin only operation.')
  },
})

export const deleteCategory = mutation({
  args: {
    id: v.id('poiCategory'),
  },
  handler: async (_ctx) => {
    // remember to delete or reassign POIs in this category
    throw new Error('Not implemented yet. admin only operation.')
  },
})

/**
 * Get a single POI category by ID
 */
export const get = query({
  args: {
    id: v.id('poiCategory'),
  },
  handler: async (ctx, { id }) => {
    const category = await ctx.db.get('poiCategory', id)
    return await injectGroupData(ctx, category)
  },
})

export const list = query({
  args: {
    pagination: paginationOptsValidator,
  },
  handler: async (ctx, { pagination }) => {
    const data = await ctx.db.query('poiCategory').paginate(pagination)
    return injectInPaginated(ctx, data)
  },
})

/**
 * Full text search for POI categories by name
 */
export const search = query({
  args: {
    name: v.string(),
    pagination: paginationOptsValidator,
  },
  handler: async (ctx, { name, pagination }) => {
    const data = await ctx.db
      .query('poiCategory')
      .withSearchIndex('search_name', (q) => q.search('name', name))
      .paginate(pagination)
    return injectInPaginated(ctx, data)
  },
})

/**
 * Get paginated POI categories in a given group
 */
export const getByGroup = query({
  args: {
    groupId: v.id('poiCategoryGroup'),
    pagination: paginationOptsValidator,
  },
  handler: async (ctx, { groupId, pagination }) => {
    const data = await ctx.db
      .query('poiCategory')
      .withIndex('groupId', (q) => q.eq('groupId', groupId))
      .paginate(pagination)
    return injectInPaginated(ctx, data)
  },
})
