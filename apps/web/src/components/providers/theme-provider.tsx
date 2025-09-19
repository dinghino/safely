/** @format */

'use client'

import { ThemeProvider as NextThemesProvider } from '@workspace/ui/providers/theme-provider'
import type * as React from 'react'

export namespace ThemeProvider {
  export type Props = {
    children: React.ReactNode
  } & React.ComponentProps<typeof NextThemesProvider>
}

export function ThemeProvider({ children, ...props }: ThemeProvider.Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
