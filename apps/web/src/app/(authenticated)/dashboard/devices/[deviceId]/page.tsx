import type { Id } from '@workspace/backend/dataModel'
import { DevicePageClient } from './page.client'

type Props = {
  params: Promise<{ deviceId: Id<'devices'> }>
}

export default async function DevicePage({ params }: Props) {
  const { deviceId } = await params

  return <DevicePageClient deviceId={deviceId} />
}
