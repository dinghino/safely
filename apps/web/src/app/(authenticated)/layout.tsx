'use client'

import { ClerkLoaded, ClerkLoading, RedirectToSignIn } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
// import { UserPresenceProvider } from '@/features/presence/contexts'
// import { DeviceContextProvider } from '@/features/device-tracking'

import { cn } from '@/lib/utils'

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
            {/* <SubHeader /> */}
            <main className="isolate flex-1">{children}</main>
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

// biome-ignore lint/correctness/noUnusedVariables: playground
function SubHeader() {
  return (
    <div
      className={cn(
        'sticky',
        'top-(--header-height) right-0 h-(--header-height)',
        'max-h-fit gap-4 border-b p-2',
        'inline-flex justify-end',
        'z-50 bg-background',
      )}
    >
      <LastGeoTime />
      <LastHeartbeatTime />
    </div>
  )
}
