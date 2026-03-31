import type { WithoutSystemFields } from 'convex/server'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { slugify } from '../lib'

export type CategorySeed = Omit<
  WithoutSystemFields<Doc<'poiCategory'> & { groupName: GroupName }>,
  'groupId'
>
export type CategoryGroupSeed = WithoutSystemFields<Doc<'poiCategoryGroup'>>
type GroupMapping = { name: string; id: Id<'poiCategoryGroup'> }

export async function populatePoiCategoryGroups(ctx: MutationCtx): Promise<GroupMapping[]> {
  return await Promise.all(
    POI_CATEGORY_GROUPS.map(async (group) => {
      const existing = await ctx.db
        .query('poiCategoryGroup')
        .withIndex('name', (q) => q.eq('name', group.name))
        .first()
      if (existing) {
        return { name: existing.name, id: existing._id }
      }
      const id = await ctx.db.insert('poiCategoryGroup', { ...group, slug: slugify(group.name) })
      return { name: group.name, id }
    }),
  )
}

// upsert a single category given the group mappings
async function upsertCategory(
  ctx: MutationCtx,
  category: Omit<CategorySeed, 'slug'>,
  groupMappings: GroupMapping[],
) {
  const groupId = groupMappings.find((g) => g.name === category.groupName)!.id
  const existing = await ctx.db
    .query('poiCategory')
    .withIndex('name', (q) => q.eq('name', category.name))
    .first()
  if (existing) return existing._id
  const { groupName, ...categoryData } = category
  return ctx.db.insert('poiCategory', {
    ...categoryData,
    slug: slugify(category.name),
    groupId,
  })
}

async function populatePoiCategories(ctx: MutationCtx, groupMappings: GroupMapping[]) {
  return await Promise.all(
    POI_CATEGORIES.map(async (category) => {
      const id = await upsertCategory(ctx, category, groupMappings)
      return id
    }),
  )
}

export async function seedPoiCategories(ctx: MutationCtx) {
  console.log('🌱 Seeding POI category groups...')
  const groupMappings = await populatePoiCategoryGroups(ctx)
  console.log('✅ POI category groups seeded.')
  console.log('🌱 Seeding POI categories...')
  await populatePoiCategories(ctx, groupMappings)
  console.log('✅ POI categories seeded.')
}

const POI_CATEGORY_GROUPS = [
  {
    name: 'Dangers',
    description: 'Dangerous areas or hazards to be aware of.',
    color: { format: 'hex', value: '#EF5350' },
  },
  {
    name: 'Facilities',
    description: 'Public facilities available for use.',
    color: { format: 'hex', value: '#43A047' },
  },
  {
    name: 'Services',
    description: 'Non emergency services for pets and owners.',
    color: { format: 'hex', value: '#0288D1' },
  },
  {
    name: 'Health & Emergency',
    description: 'Medical and emergency services for pets.',
    color: { format: 'hex', value: '#E53935' },
  },
  {
    name: 'Shopping',
    description: 'Shops and retail locations for pet supplies and more.',
    color: { format: 'hex', value: '#8E6FF2' },
  },
  {
    name: 'Alerts',
    description: 'Pet-related alerts, sightings, and community notifications.',
    color: { format: 'hex', value: '#FFB300' },
  },
] as const satisfies Omit<CategoryGroupSeed, 'slug'>[]

type GroupName = (typeof POI_CATEGORY_GROUPS)[number]['name']

const POI_CATEGORIES = [
  {
    name: 'Dog Park',
    description: 'Designated area for dogs to play off-leash.',
    groupName: 'Facilities',
    icon: { name: 'fence' },
  },
  {
    name: 'Off-Leash Area',
    description: 'Area where dogs are permitted off-leash; check local rules.',
    groupName: 'Facilities',
    icon: { name: 'trees' },
  },
  {
    name: 'Leash-Required Area',
    description: 'Areas where dogs must be kept on a leash.',
    groupName: 'Facilities',
    icon: { name: 'hand' },
  },
  {
    name: 'Dog Waste Station',
    description: 'Bag dispensers and waste bins for dog owners.',
    groupName: 'Facilities',
    icon: { name: 'trash' },
  },
  {
    name: 'Water Fountain',
    description: 'Public water fountain suitable for pets or people.',
    groupName: 'Facilities',
    icon: { name: 'droplet' },
  },
  {
    name: 'Vet Clinic',
    description: 'Regular veterinary clinic for non-emergency care.',
    groupName: 'Health & Emergency',
    icon: { name: 'cross' },
  },
  // these will be defined by category features later on and allow users to find
  // them from context
  // {
  //   name: 'Emergency Vet',
  //   description: '24/7 emergency veterinary services.',
  //   groupName: 'Health/Emergency',
  //   icon: { name: 'hospital' },
  // },
  // {
  //   name: 'Animal Hospital',
  //   description: 'Full-service animal hospital.',
  //   groupName: 'Health/Emergency',
  //   icon: { name: 'hospital' },
  // },
  {
    name: 'Groomer',
    description: 'Pet grooming and hygiene services.',
    groupName: 'Services',
    icon: { name: 'scissors' },
  },
  {
    name: 'Pet Sitting / Boarding',
    description: 'Short-term or long-term pet care and boarding.',
    groupName: 'Services',
    icon: { name: 'home' },
  },
  {
    name: 'Shelter / Rescue',
    description: 'Places offering temporary shelter or rescue services.',
    groupName: 'Services',
    icon: { name: 'house-heart' },
  },
  // // will be added later with organization partnerships and rescue centers
  // {
  //   name: 'Adoption Center',
  //   description: 'Rescue center or shelter where animals are available for adoption.',
  //   groupName: 'Services',
  //   icon: { name: 'heart' },
  // },
  // // this is meant to be like a shopping mall
  // {
  //   name: 'Pet Store',
  //   description: 'Retail store selling pet food, toys and supplies.',
  //   groupName: 'Shopping',
  //   icon: { name: 'store' },
  // },
  {
    name: 'Pet Supply Store',
    description: 'Specialist supplies and accessories for pets.',
    groupName: 'Shopping',
    icon: { name: 'shopping-bag' },
  },
  {
    name: 'Dog-Friendly facilities',
    description: 'Facilities that welcome dogs (often outdoor seating).',
    groupName: 'Facilities',
    icon: { name: 'coffee' },
  },
  {
    name: 'Dog-Friendly Beach',
    description: 'Beaches or shoreline areas where dogs are allowed.',
    groupName: 'Facilities',
    icon: { name: 'volleyball' },
  },
  // // this is a full on feature we'll add later
  // {
  //   name: 'Hiking Trail',
  //   description: 'Walking or hiking trails; may have hazards or leash rules.',
  //   groupName: 'Facilities',
  //   icon: { name: 'trail' },
  // },
  {
    name: 'Bait / Poison',
    description: 'Reported baiting or poisoned food found in the area. Report immediately.',
    groupName: 'Dangers',
    icon: { name: 'skull' },
  },
  {
    name: 'Suspicious Bait',
    description: 'Suspicious food or objects that could be harmful to animals.',
    groupName: 'Dangers',
    icon: { name: 'triangle-alert' },
  },
  {
    name: 'Road Hazard',
    description: 'Traffic-related hazards for pets (open gates, fast roads).',
    groupName: 'Dangers',
    icon: { name: 'car' },
  },
  {
    name: 'Trail Hazard',
    description: 'Natural hazards on trails (cliffs, unstable ground).',
    groupName: 'Dangers',
    icon: { name: 'triangle' },
  },
  {
    name: 'Lost Pet',
    description: 'Sightings or reports of a lost pet needing help to reunite.',
    groupName: 'Alerts',
    icon: { name: 'search' },
  },
  {
    name: 'Found Pet',
    description: 'Reports of found animals waiting to be reclaimed.',
    groupName: 'Alerts',
    icon: { name: 'flag' },
  },
  {
    name: 'Aggressive Animal Sightings',
    description: 'Reports of aggressive or dangerous animals in the area.',
    groupName: 'Alerts',
    icon: { name: 'angry' },
  },
  {
    name: 'Community Alert',
    description: 'General alerts relevant to pet owners (contagious disease, recall).',
    groupName: 'Alerts',
    icon: { name: 'bell' },
  },
  {
    name: 'Animal Control Office',
    description: 'Local animal control or municipal pet services.',
    groupName: 'Health & Emergency',
    icon: { name: 'shield' },
  },
] as const satisfies Omit<CategorySeed, 'slug'>[]
