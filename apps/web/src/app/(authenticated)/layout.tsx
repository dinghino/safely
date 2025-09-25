'use client'

import { ClerkLoaded, ClerkLoading, RedirectToSignIn } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
// import { UserPresenceProvider } from '@/features/presence/contexts'
// import { DeviceContextProvider } from '@/features/device-tracking'
import { AuthenticatedProviders } from '@/components/providers'

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
          {/* <DeviceContextProvider> */}

          <AuthenticatedProviders>{children}</AuthenticatedProviders>

          {/* </DeviceContextProvider> */}
          {/* </UserPresenceProvider> */}
        </Authenticated>
        <Unauthenticated>
          {/* <Loader /> */}
          <RedirectToSignIn />
        </Unauthenticated>
        <AuthLoading>
          <Loader />
        </AuthLoading>
      </ClerkLoaded>
    </>
  )
}
