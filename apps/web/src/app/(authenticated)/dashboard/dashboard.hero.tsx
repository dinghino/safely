'use client'

import { useUser } from '@clerk/nextjs'

export function DashboardHero() {
  const user = useUser()
  return (
    <header className="space-y-1 py-4">
      <h1 className="font-bold text-4xl">Dashboard</h1>
      <p className="text-muted-foreground text-sm">Welcome back, {user.user?.firstName}</p>
    </header>
  )
}
