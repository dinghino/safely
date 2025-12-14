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
    if (!category) return null
    return await injectGroupData(ctx, category)
  },
})

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const data = await ctx.db.query('poiCategory').paginate(paginationOpts)
    return await injectInPaginated(ctx, data)
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
export const getByGroupId = query({
  args: {
    groupId: v.id('poiCategoryGroup'),
    // paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { groupId }) => {
    const categories = await ctx.db
      .query('poiCategory')
      .withIndex('groupId', (q) => q.eq('groupId', groupId))
      .collect()
    const withGroup = categories.map((category) => injectGroupData(ctx, category))
    return await Promise.all(withGroup)
  },
  // handler: async (ctx, { groupId, paginationOpts }) => {
  //   const data = await ctx.db
  //     .query('poiCategory')
  //     .withIndex('groupId', (q) => q.eq('groupId', groupId))
  //     .paginate(paginationOpts)
  //   return injectInPaginated(ctx, data)
  // },
})

export const getByGroupSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    // first get the group by slug
    const group = await ctx.db
      .query('poiCategoryGroup')
      .withIndex('slug', (q) => q.eq('slug', slug))
      .first()
    if (!group) return null
    // then get categories in that group
    const categories = await ctx.db
      .query('poiCategory')
      .withIndex('groupId', (q) => q.eq('groupId', group._id))
      .collect()
    const withGroup = categories.map((category) => injectGroupData(ctx, category))
    const page = await Promise.all(withGroup)
    return page

    // const data = await ctx.db
    //   .query('poiCategory')
    //   .withIndex('groupId', (q) => q.eq('groupId', group._id))
    //   .paginate(paginationOpts)
    // return injectInPaginated(ctx, data)
  },
})
