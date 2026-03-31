import { MapSectionBreadcrumbs } from '../../../components/breadcrumbs'

type Props = {
  params: Promise<{ all: string[]; coords: string }>
}

export default async function MapExploreHeader({ params }: Props) {
  const { all, coords } = await params

  return (
    <MapSectionBreadcrumbs
      coords={coords}
      root={{ path: 'explore', label: 'Places' }}
      slugs={all}
    />
  )
}
