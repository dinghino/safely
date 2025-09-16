'use client'

/** @format */

import { Authenticated, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <Loader />
      </ClerkLoading>
      <ClerkLoaded>
        <Authenticated>{children}</Authenticated>
        <Unauthenticated>
          <Loader />
        </Unauthenticated>
      </ClerkLoaded>
    </>
  )
}
