'use client'

import { Authenticated } from 'convex/react'

import {
  LayoutDashboardIcon,
  ListTodoIcon,
  MapIcon,
  MapPinIcon,
  PawPrintIcon,
  SettingsIcon,
  SmartphoneIcon,
  type LucideIcon,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import Link from 'next/link'

import { SidebarDevicesList } from '@/features/device-manager/components'

// Menu items.
const items = [
  // {
  //   title: 'Home',
  //   url: '/',
  //   icon: HomeIcon,
  // },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Devices',
    url: '/devices',
    icon: SmartphoneIcon,
  },
  {
    title: 'Places',
    url: '/places',
    icon: MapPinIcon,
  },
  {
    title: 'Maps',
    url: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Tasks',
    url: '/todos',
    icon: ListTodoIcon,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: SettingsIcon,
    disabled: true,
  },
] satisfies {
  title: string
  url: React.ComponentProps<typeof Link>['href']
  icon: LucideIcon
  disabled?: boolean
}[]

export function DashboardSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-(--header-height) border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <PawPrintIcon />
                <span>Safely</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild disabled={item.disabled} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Authenticated>
          <SidebarDevicesList />
        </Authenticated>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
