import { LastKnownLocationMap } from '@/views/map-last-known-locations'

type PageProps = {
  params: Promise<unknown>
  searchParams: Promise<unknown>
}
export default function MapPage(_props: PageProps) {
  return (
    <LastKnownLocationMap />
  )
}
