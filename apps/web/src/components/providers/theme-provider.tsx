/** @format */

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type * as React from 'react'

export namespace ThemeProvider {
  export type Props = {
    children: React.ReactNode
  } & React.ComponentProps<typeof NextThemesProvider>
}

export function ThemeProvider({ children, ...props }: ThemeProvider.Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
