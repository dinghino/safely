'use client'

/** @format */

import { Authenticated, Unauthenticated } from 'convex/react'
import Loader from '@/components/loader'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <Loader />
      </Unauthenticated>
    </>
  )
}
