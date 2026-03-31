import { fetchQuery } from 'convex/nextjs'
import { ExplorePageTitle } from '../components/explore-page-title'
import { PlacesList } from '../components/places-list'
import { api } from '@workspace/backend/api'
import { PlaceCategoryItem } from '@/entities/places/components/category-item'
import Link from 'next/link'
import { Separator } from '@workspace/ui/components/separator'

export default async function CategoryGroupPage(props: { params: Promise<{ group: string }> }) {
  const { group } = await props.params
  const categories = await fetchQuery(api.pois.categories.getByGroupSlug, { slug: group })
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {categories?.map(cat => (
          <Link href={`/places/explore/${group}/${cat.slug}`} key={cat._id}>
            <PlaceCategoryItem variant="lg" category={cat} className="border border-muted/25 hover:bg-muted" />
          </Link>
        ))}
      </div>
      <Separator className='my-8' />
      <PlacesList />
    </>
  )
}
