import type { Id } from '@workspace/backend/types'
import { SessionMap } from '@/views/session-map'

type PageProps = {
  params: Promise<{ sessionId: Id<'trackSession'> }>
  // searchParams: Promise<unknown>
}
export default async function MapPage(props: PageProps) {
  const { sessionId } = await props.params
  return (
    <div className="h-full max-h-[calc(100vh_-_var(--header-height)_*_2)] w-full">
      <SessionMap sessionId={sessionId} />
    </div>
  )
}
