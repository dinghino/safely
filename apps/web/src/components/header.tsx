'use client'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'

export default function Header() {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/todos', label: 'Todos' },
  ] as const

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Button asChild variant="link" key={to}>
                <Link href={to}>{label}</Link>
              </Button>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Authenticated>
            <Button asChild variant="outline">
              <UserButton
                fallback={<div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />}
                appearance={{
                  layout: { shimmer: false },
                  elements: {
                    avatarBox: '!rounded-lg',
                  },
                }}
              />
            </Button>
          </Authenticated>
          <Unauthenticated>
            <Button asChild variant="default">
              <SignInButton />
            </Button>
          </Unauthenticated>
        </div>
      </div>
      <hr />
    </div>
  )
}
