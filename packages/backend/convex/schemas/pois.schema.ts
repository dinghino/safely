import { defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * General spanning groups for POI categorization.
 * E.g. "Food & Drink", "Shopping", "Dangers", "Services", etc.
 */
export const poiCategoryGroup = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  /**
   * Color information for the POI category icon
   * Stored as an object to allow for different formats
   * E.g. hex, rgb, hsl, etc.
   */
  color: v.object({
    format: v.string(),
    value: v.string(),
  }),
})
  .index('name', ['name'])
  .index('slug', ['slug'])
  .searchIndex('search_name', { searchField: 'name', filterFields: ['slug'] })
  .searchIndex('search_slug', { searchField: 'slug', filterFields: ['name'] })

/**
 * Point of Interest categories
 * E.g. "Dog parks", "Vet clinics", "Hiking trails", "Shops",
 * "Dog Sitters", etc.
 */
export const poiCategory = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  /**
   * This is the icon NAME - we are currently using lucide,
   * so this should correspond to a lucide icon name.
   * Nested object to allow for future expansion (e.g. icon set, style, etc)
   */
  icon: v.object({
    name: v.string(),
  }),
  groupId: v.id('poiCategoryGroup'),
})
  .index('name', ['name'])
  .index('groupId', ['groupId'])
  .index('search_slug', ['slug'])
  .searchIndex('search_name', {
    searchField: 'name',
    filterFields: ['groupId', 'slug'],
  })
  .searchIndex('slug', {
    searchField: 'slug',
    filterFields: ['groupId', 'name'],
  })

export const pointOfInterest = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.id('poiCategory'),
  addedBy: v.id('users'),
  /**
   * geohash for the POI location to allow for efficient querying
   * and proximity searches.
   * This allows us to avoid complex geospatial queries for simple
   * searches and filtering results by location.
   */
  geohash: v.string(),
  // for external references
  attribution: v.optional(v.object({
    source: v.string(),
    url: v.optional(v.string()),
  })),
})
  // default index for all POIs in a defined area
  .index('geohash', ['geohash'])
  // default combined query for nearby POIs by category
  .index('category_hash', ['categoryId', 'geohash'])
  // category lookup
  .index('category', ['categoryId'])
  // by whom added, mostly for auditing and show a user their added POIs
  .index('addedBy', ['addedBy'])
  .searchIndex('search_name', {
    searchField: 'name',
    filterFields: ['categoryId', 'geohash'],
  })
