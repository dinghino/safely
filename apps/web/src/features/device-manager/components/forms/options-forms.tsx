'use client'

import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import type { Device, TrackingMode } from '@workspace/backend/types'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { DeviceOptionsForm } from '@/entities/device/components'

export namespace EditDeviceOptionsForm {
  export type Props = {
    device: Device
  }
}
/**
 * Multi-form component to edit device options.
 */
export const EditDeviceOptionsForm: React.FC<EditDeviceOptionsForm.Props> = (props) => {
  const { device } = props
  const data = useQuery(api.devices.options.getAll, { deviceId: device._id })
  const save = useMutation(api.devices.options.save)

  const makeHandleSubmit = (mode: TrackingMode) => {
    return async (data: Device['settings']) => {
      await save({ deviceId: device._id, mode, data })
    }
  }
  return (
    <>
      {data?.map((group) => (
        <Card key={group._id}>
          <CardHeader className="border-b">
            <CardTitle>{group.mode.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceOptionsForm
              values={group}
              className="space-y-4"
              onSubmit={makeHandleSubmit(group.mode)}
            />
          </CardContent>
        </Card>
      ))}
    </>
  )
}
