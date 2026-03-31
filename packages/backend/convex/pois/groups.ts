import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

// region groups

export const addGroup = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
    }),
  },
  handler: async (_ctx) => {
    throw new Error('Not implemented yet. admin only operation.')
  },
})

export const editGroup = mutation({
  args: {
    id: v.id('poiCategoryGroup'),
  },
  handler: async (_ctx) => {
    throw new Error('Not implemented yet. admin only operation.')
  },
})

export const deleteGroup = mutation({
  args: {
    id: v.id('poiCategoryGroup'),
  },
  handler: async (_ctx) => {
    // remember to delete or reassign categories in this group
    throw new Error('Not implemented yet. admin only operation.')
  },
})

export const get = query({
  args: {
    id: v.id('poiCategoryGroup'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get('poiCategoryGroup', id)
  },
})

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('poiCategoryGroup').collect()
  },
})

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query('poiCategoryGroup')
      .withIndex('slug', (q) => q.eq('slug', slug))
      .first()
  },
})
