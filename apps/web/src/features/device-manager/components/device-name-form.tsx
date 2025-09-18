import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { useMutation } from 'convex/react'
import type { Device } from '../types'

export function DeviceRenameForm({ device }: { device: Device }) {

  const rename = useMutation(api.devices.renameDevice)
  return (
    <form
      className="mt-4 flex w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get('name') as string
        rename({ deviceId: device._id, name })
      }}
    >
      <Input name="name" defaultValue={device.name} placeholder="Enter new device name" />
      <Button type="submit">Rename</Button>
    </form>
  )
}
