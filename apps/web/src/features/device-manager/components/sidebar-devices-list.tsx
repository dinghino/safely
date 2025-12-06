'use client'

import { DeviceIcon, DeviceStatusDot } from '@/entities/device/components'
import { api } from '@workspace/backend/api'
import type { Device } from '@workspace/backend/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroupAction,
} from '@workspace/ui/components/sidebar'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useQuery } from 'convex/react'
import { ChevronDown, MoreHorizontalIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function SidebarDevicesList() {
  const devices = useQuery(api.devices.get.all)

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel className="inline-flex items-center justify-start rounded-md px-2 hover:bg-muted">
          <CollapsibleTrigger className="inline-flex flex-1 cursor-pointer items-center justify-start gap-2 py-2">
            <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            Devices
          </CollapsibleTrigger>
          <SidebarGroupAction
            onClick={() => {
              toast.info('Add Device clicked', {
                description: 'This will open flow to add a new device or register this one.',
              })
            }}
          >
            <Plus /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* undefined when loading */}
              {devices === undefined
                ? // Array.from({ length: 5 }).map((_, index) => <SidebarMenuSkeleton key={index} />)
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton className="h-6 w-full" key={index} />
                  ))
                : null}
              {/* no devices registered */}
              {devices?.length === 0 ? (
                <div className="p-2 text-muted-foreground text-sm">No devices</div>
              ) : null}

              {devices?.map((device) => (
                <DeviceSidebarItem key={device._id} device={device} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function DeviceSidebarItem({ device }: { device: Device }) {
  const isActive = useIsActiveLink(device._id)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={device.name} asChild isActive={isActive}>
        <Link
          href={{
            pathname: `/devices/${device._id}`,
          }}
        >
          <div className="relative isolate">
            <DeviceIcon device={device} className="h-4 w-4 shrink-0" />
            <DeviceStatusDot device={device} className="-right-1 -bottom-1 absolute" />
          </div>
          <span>{device.name}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        className="peer-data-[active=true]/menu-button:opacity-100"
        onClick={() =>
          toast('Action clicked', {
            description: `Action for device ${device.name} clicked.`,
          })
        }
      >
        <MoreHorizontalIcon />
      </SidebarMenuAction>
    </SidebarMenuItem>
  )
}

function useIsActiveLink(deviceId: string) {
  const pathname = usePathname()
  return pathname === `/devices/${deviceId}`
}
