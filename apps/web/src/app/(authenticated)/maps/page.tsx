import { encodeFromMap, queryInitialLocation } from '@/lib/coordinates-encoding'
import { redirect } from 'next/navigation'

type Props = {}

/**
 * This page should never render. we always redirect to /maps/@lat,lng,zoom
 * regardless.so if we end up to this route page we know we are not where we
 * are supposed to be.
 */
export default async function MapPageCatchAll(_props: Props) {
  const initial = await queryInitialLocation()
  const encoded: string = encodeFromMap(initial, { precision: 6 })
  const url = `/maps/${encoded}`
  redirect(url as any) // we are redirecting to a valid URL, being /maps/[latlngz]

  return null
}
