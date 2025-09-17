'use client'

import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'


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
