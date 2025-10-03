import type { Id } from '@workspace/backend/dataModel'
import { DevicePageClient } from './page.client'

export default async function DevicePage({ params }: { params: Promise<{ deviceId: Id<'devices'> }> }) {
  const { deviceId } = await params

  return <DevicePageClient deviceId={deviceId} />
}
