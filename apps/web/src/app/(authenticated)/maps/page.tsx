import { LastKnownLocationMap } from '@/views/map-last-known-locations'

type PageProps = {
  params: Promise<unknown>
  searchParams: Promise<unknown>
}
export default function MapPage(_props: PageProps) {
  return (
    <div className="h-full max-h-[calc(100vh_-_var(--header-height)_*_2)] w-full">
      <LastKnownLocationMap />
    </div>
  )
}
