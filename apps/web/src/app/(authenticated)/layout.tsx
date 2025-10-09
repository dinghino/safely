'use client'

import { ClerkLoaded, ClerkLoading, RedirectToSignIn } from '@clerk/nextjs'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
// import { UserPresenceProvider } from '@/features/presence/contexts'
// import { DeviceContextProvider } from '@/features/device-tracking'

import { AuthenticatedProviders } from '@/components/providers'

import { LastGeoTime } from '@/features/geolocation/components'
import { LastHeartbeatTime } from '@/features/heartbeat/components'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { MapIcon } from 'lucide-react'

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
              <div
                className={cn(
                  'inline-flex max-h-fit w-full gap-4 border-b p-2',
                  'sticky top-[var(--header-height)] z-50 w-full bg-background',
                )}
              >
                <Button asChild variant="ghost" size="sm">
                  <Link<string> href="/maps">
                    <MapIcon />
                    <span className="max-md:sr-only">Maps</span>
                  </Link>
                </Button>
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
