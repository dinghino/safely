'use client'

import { useMutation } from 'convex/react'
import type { Device } from '../types'
import { api } from '@workspace/backend/api'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'

/**
 * Allow renaming a device.
 * This will be expanded with more fields to edit the device properties when
 * we add them
 * @todo refactor with tanstac/react-form
 * @see {@link https://tanstack.com/form}
 * @see {@link https://www.youtube.com/watch?v=YJ3rW85fnKo} for quickstart
 */

export function DeviceForm({ device }: { device: Device }) {
  const rename = useMutation(api.devices.renameDevice)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    rename({ deviceId: device._id, name })
  }

  return (
    <form className="mt-4 flex w-full gap-2" onSubmit={handleSubmit}>
      <Input name="name" defaultValue={device.name} placeholder="Enter new device name" />
      <Button type="submit">Rename</Button>
    </form>
  )
}
