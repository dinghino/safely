'use client'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useQuery } from 'convex/react'
import { use } from 'react'

type Props = {
  params: Promise<{ deviceId: Id<'devices'> }>
}

export default function DevicePage({ params }: Props) {
  // const { deviceId } = await params
  const { deviceId } = use(params)
  const device = useQuery(api.devices.get.one, { deviceId })

  if (device === undefined) {
    return <div className="p-4">Loading...</div>
  }

  if (device === null) {
    return <div className="p-4">Device not found</div>
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-3xl">{device.name}</h1>
      <p className="text-muted-foreground text-xs">{deviceId}</p>
    </div>
  )
}
