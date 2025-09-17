'use client'

import { useUser } from '@clerk/nextjs'
import { api } from '@workspace/backend/convex/_generated/api'
import { useQuery } from 'convex/react'

export function DashboardHero() {
  const user = useUser()
  const privateData = useQuery(api.privateData.get)
  return (
    <header className="space-y-2 py-4">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <p>Welcome {user.user?.fullName}</p>
      <p>privateData: {privateData?.message}</p>
    </header>
  )
}
