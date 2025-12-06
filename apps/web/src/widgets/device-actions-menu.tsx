'use client'

import { MoreVertical, PencilIcon, SettingsIcon, Share2Icon, Trash2Icon } from 'lucide-react'
import { useMutation } from 'convex/react'

import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { DeleteDialogButton } from '@workspace/ui/components/delete-dialog-button'

import { SessionButton } from '@/features/device-tracking/components'

import type { Device } from '@/entities/device/types'
import { EditDeviceForm } from '../features/device-manager/components/forms'

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

export namespace DeviceActionsMenu {
  export type Props = {
    device: Device
  } & React.ComponentProps<typeof Button>
}

/**
 * Dropdown menu for most common device actions
 */
export function DeviceActionsMenu({ device, ...props }: DeviceActionsMenu.Props) {
  const unregister = useMutation(api.devices.manage.unregister)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" {...props}>
          <span className="sr-only">Open menu</span>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Share2Icon />
          Share...
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <EditDeviceForm
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          }
          device={device}
        />
        <DropdownMenuSeparator />
        <DeleteDialogButton
          modal
          onClick={async () => {
            await unregister({ id: device._id })
          }}
          title="Unregister Device"
          description="Are you sure you want to unregister this device? This action cannot be undone."
          confirmText="Unregister"
        >
          <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
            <Trash2Icon />
            Unregister
          </DropdownMenuItem>
        </DeleteDialogButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
