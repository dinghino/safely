import { PlacesList } from '../../components/places-list'

export default async function CategoryPage(props: {
  params: Promise<{ group: string; category: string }>
}) {
  const { group, category } = await props.params
  return <PlacesList />
}
