'use client'

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      theme: shadcn,
      cssLayerName: 'clerk',
      // baseTheme: theme === 'dark' ? dark : undefined,
    }}>
      {children}
    </ClerkProvider>
  )
}
