'use client'

import z from 'zod/v4'
import { toast } from 'sonner'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'
import { useAppForm } from '@workspace/form'
import type { Device } from '@/entities/device/types'

/**
 * Allow renaming a device.
 * @note This will be expanded with more fields to edit the device properties when
 * we add them
 */
export function DeviceForm({ device }: { device: Device }) {
  const rename = useMutation(api.devices.renameDevice)

  const form = useAppForm({
    defaultValues: { name: device.name ?? '' },
    validators: {
      onChange: z.object({ name: z.string() }),
    },
    onSubmit: async ({ value }) => {
      toast.promise(rename({ deviceId: device._id, name: value.name }), {
        loading: 'Renaming device...',
        success: 'Device renamed',
        error: 'Failed to rename device',
      })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <form className="mt-4 flex w-full flex-col gap-2" onSubmit={handleSubmit}>
      <form.AppField name="name" children={(field) => <field.TextField />} />
      <form.AppForm>
        <form.SubmitButton>Submit</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
