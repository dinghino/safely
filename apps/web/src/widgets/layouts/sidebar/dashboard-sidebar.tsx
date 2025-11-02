'use client'

import { Authenticated } from 'convex/react'

import {
  HomeIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  MapIcon,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'
import Link from 'next/link'

import {SidebarDevicesList} from '@/features/device-manager/components'

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: HomeIcon,
  },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Maps',
    url: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Devices',
    url: '/devices',
    icon: SmartphoneIcon,
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    disabled={item.disabled}
                    tooltip={{
                      children: item.title,
                      hidden: false,
                      hideWhenDetached: true,
                    }}
                  >
                    {item.disabled ? (
                      <div>
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    ) : (
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    )}
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
    </Sidebar>
  )
}
