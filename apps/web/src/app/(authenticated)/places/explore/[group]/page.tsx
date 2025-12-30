import { ExplorePageTitle } from '../components/explore-page-title'
import { PlacesList } from '../components/places-list'

export default async function CategoryGroupPage(props: { params: Promise<{ group: string }> }) {
  const { group } = await props.params
  return (
    <>
      <h1 className="mb-6 font-bold text-xl">{group}</h1>
      <PlacesList />
    </>
  )
}
