import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@workspace/ui/globals.css'
import './styles.css'
import '@workspace/data-filter/styles.css'

import Header from '@/components/header'
import { RootProviders } from '@/components/providers'
import { Toaster } from '@workspace/ui/components/sonner'
import { cn } from '@/lib/utils'
import { CodeIcon, HomeIcon, LayoutDashboardIcon, ListChecks, type LucideIcon } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'safely',
  description: 'safely',
}

function MenuLabel({ text, icon: Icon }: { text: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-row items-center min-md:gap-2">
      <Icon className="h-5 w-5" />
      <span className="max-md:sr-only">{text}</span>
    </div>
  )
}

const links = [
  { href: '/', label: <MenuLabel text="Home" icon={HomeIcon} /> },
  { href: '/dashboard', label: <MenuLabel text="Dashboard" icon={LayoutDashboardIcon} /> },
  { href: '/todos', label: <MenuLabel text="Todos" icon={ListChecks} /> },
  { href: '/demo', label: <MenuLabel text="Demo" icon={CodeIcon} /> },
] satisfies Header.Props['links']

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, 'relative antialiased')}>
        <RootProviders>
          {/* <div className="grid h-svh grid-rows-[auto_1fr]"> */}
          <div className="h-svh">
            <div className="sticky top-0 z-50 bg-background">
              <Header links={links} />
            </div>
            {children}
          </div>
          <Toaster richColors />
        </RootProviders>
      </body>
    </html>
  )
}
