import { DevicePageClient } from './page.client'

export default async function DevicePage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params

  return <DevicePageClient deviceId={deviceId} />
}
