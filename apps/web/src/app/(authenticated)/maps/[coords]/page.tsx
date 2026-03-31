'use client'
import { Button } from '@workspace/ui/components/button'
// import { PlacesList } from '@/app/(authenticated)/places/explore/components/places-list'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/**
 * The root page of the map view, contained in the sidebar. shows overview
 * of the area, major (highlighted, sponsored, favorites...) points of interest
 * as well as some navigation tools to go to the other internal routes.
 */
export default function RootMapPage() {
  const { coords } = useParams<{ coords: string }>()
  return (
    <>
      <h1 className="text-xl">Map view</h1>
      <p>
        This view will allow users to view the highlights of the and navigate to other internal
        routes.
      </p>
      <Link
        href={{
          pathname: `/maps/${decodeURIComponent(coords)}/explore`,
          // slashes: true,
        }}
      >
        <Button>Explore places</Button>
      </Link>
    </>
  )
}
