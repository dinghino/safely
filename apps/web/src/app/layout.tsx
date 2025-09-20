import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@workspace/ui/globals.css'
import './styles.css'
import '@workspace/data-filter/styles.css'

import Header from '@/components/header'
import Providers from '@/components/providers'
import { Toaster } from '@workspace/ui/components/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'safely',
  description: 'safely',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            {children}
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}
