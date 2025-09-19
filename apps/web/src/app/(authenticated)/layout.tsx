'use client'

import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
import { UserPresenceProvider } from '@/features/presence/contexts'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <Loader />
      </ClerkLoading>
      <ClerkLoaded>
        <Authenticated>
          {/* disabled due to crypto package for localhost */}
          {/* <UserPresenceProvider> */}
            {children}
            {/* </UserPresenceProvider> */}
        </Authenticated>
        <Unauthenticated>
          <Loader />
        </Unauthenticated>
      </ClerkLoaded>
    </>
  )
}
