import type { Id } from '@workspace/backend/types'
import { SessionMap } from '@/views/session-map'

type PageProps = {
  params: Promise<{ sessionId: Id<'trackSession'> }>
  // searchParams: Promise<unknown>
}
export default async function MapPage(props: PageProps) {
  const { sessionId } = await props.params
  return (
    <SessionMap sessionId={sessionId} />
  )
}
