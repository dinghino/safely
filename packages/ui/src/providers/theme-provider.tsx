'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
export { useTheme }

export namespace ThemeProvider {
  export type Props = {
    children: React.ReactNode
  } & React.ComponentProps<typeof NextThemesProvider>
}

export function ThemeProvider({ children, ...props }: ThemeProvider.Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
