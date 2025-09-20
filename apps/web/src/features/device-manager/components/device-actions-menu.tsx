'use client'

import { MoreVertical } from 'lucide-react'
import { useMutation } from 'convex/react'

import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import { useIsCurrent } from '../hooks/use-is-current'

import type { Device } from '@/entities/device/types'
import { DeviceForm } from './device-form'
import { SessionButton } from '@/features/device-tracking/components/session-button'
import { useState } from 'react'

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
  const unregister = useMutation(api.devices.deleteDevice)
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
        <DropdownMenuItem disabled={isCurrent} onClick={() => unregister({ id: device._id })}>
          Unregister
        </DropdownMenuItem>
        <DialogForm
          trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Rename</DropdownMenuItem>}
          device={device}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DialogForm({ trigger, device }: { trigger: React.ReactNode; device: Device }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Device</DialogTitle>
          <DialogDescription>Enter a new name for your device.</DialogDescription>
        </DialogHeader>
        <DeviceForm device={device} onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
