'use client'

import { MoreVertical } from 'lucide-react'
import { useMutation } from 'convex/react'

import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { DeleteDialogButton } from '@workspace/ui/components/delete-dialog-button'

import { SessionButton } from '@/features/device-tracking/components'
import { useIsCurrent } from '../hooks/use-is-current'

import type { Device } from '@/entities/device/types'
import { EditDeviceForm } from './forms'

export function ActionsCell({ device }: { device: Device }) {
  // const isCurrent = useIsCurrent({ device })

  return (
    <div className="inline-flex w-full justify-end gap-1">
      {/* {isCurrent && <DevicePositionManager device={device} />} */}
      <SessionButton size="sm" deviceId={device._id} />
      <DeviceActionsMenu device={device} />
    </div>
  )
}

export function DeviceActionsMenu({ device }: { device: Device }) {
  const unregister = useMutation(api.devices.manage.unregister)
  const isCurrent = useIsCurrent({ device })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DeleteDialogButton
          modal
          onClick={async () => {
            await unregister({ id: device._id })
          }}
          title="Unregister Device"
          description="Are you sure you want to unregister this device? This action cannot be undone."
          confirmText="Unregister"
        >
          <DropdownMenuItem disabled={isCurrent} onSelect={(e) => e.preventDefault()}>
            Unregister
          </DropdownMenuItem>
        </DeleteDialogButton>
        <EditDeviceForm
          trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>}
          device={device}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
