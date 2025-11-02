import { LastKnownLocationMap } from '@/views/map-last-known-locations'

type PageProps = {
  params: Promise<unknown>
  searchParams: Promise<unknown>
}
export default function MapPage(_props: PageProps) {
  return (
    <div className="h-full max-h-[calc(100vh-var(--header-height))] w-full">
      <LastKnownLocationMap />
    </div>
  )
}
