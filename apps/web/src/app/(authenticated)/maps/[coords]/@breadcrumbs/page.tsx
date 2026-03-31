import { MapSectionBreadcrumbs } from '../components/breadcrumbs'

export default async function DefaultMapExploreHeader({
  params,
}: {
  params: Promise<{ coords: string }>
}) {
  const { coords } = await params
  return (
    <>
      <p>BREADCRUMBS EMPTY</p>
      <MapSectionBreadcrumbs
        coords={coords}
        root={{ path: 'explore', label: 'Places' }}
        slugs={[]}
      />
    </>
  )
}
