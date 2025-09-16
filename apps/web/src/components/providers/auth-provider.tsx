import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      waitlistUrl="/waitlist"
      appearance={{
        theme: shadcn,
        cssLayerName: 'clerk',
      }}
    >
      {children}
    </ClerkProvider>
  )
}
