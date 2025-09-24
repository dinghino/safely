'use client'

import { useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { NuqsAdapter } from '@workspace/nuqs'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from '@workspace/ui/providers/theme-provider'

import { GeolocationProvider } from '@/features/geolocation'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <GeolocationProvider>{children}</GeolocationProvider>
          </ConvexProviderWithClerk>
        </AuthProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
