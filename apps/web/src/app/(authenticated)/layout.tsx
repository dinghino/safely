'use client'

import { ClerkLoaded, ClerkLoading, RedirectToSignIn } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
// import { UserPresenceProvider } from '@/features/presence/contexts'
// import { DeviceContextProvider } from '@/features/device-tracking'

import { AuthenticatedProviders } from '@/components/providers'

import { LastGeoTime } from '@/features/geolocation/components'
import { LastHeartbeatTime } from '@/features/heartbeat/components'

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

          <AuthenticatedProviders>
            <div>
              <div className="inline-flex max-h-fit w-full gap-4 border-b p-2">
                <div className="flex-1" />
                <LastGeoTime />
                <LastHeartbeatTime />
              </div>
              {children}
            </div>
          </AuthenticatedProviders>

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
