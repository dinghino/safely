'use client'

import { Authenticated } from 'convex/react'

import {
  HomeIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  MapIcon,
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
  SidebarSeparator,
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
    <Sidebar variant="sidebar" collapsible="icon" className="top(--header-height) relative">
      <SidebarHeader className="h-(--header-height) border-b px-4">
        {/* <Link href="/" className="flex items-center space-x-2">
          <PawPrintIcon className="size-4" />
          <span className="font-bold text-lg">Safely</span>
        </Link> */}
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
