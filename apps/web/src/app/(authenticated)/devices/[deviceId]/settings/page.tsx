import type { Id } from '@workspace/backend/types'

type Props = {
  params: Promise<{ deviceId: Id<'devices'> }>
}
export default async function DeviceSettingsPage({ params }: Props) {
  const { deviceId } = await params
  return (
    <div>
      <h1 className="text-lg">Device Settings Page for {deviceId}</h1>
      <p>This will be intercepted some place else with dialog and modals</p>
    </div>
  )
}
