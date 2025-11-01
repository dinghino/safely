'use client'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@workspace/ui/components/button'

export namespace Header {
  export type Props = {
    links?: ReadonlyArray<{ href: string; label: string | React.ReactNode }>
    left?: React.ReactNode
    right?: React.ReactNode
  }
}

export const Header = ({ links = [], left, right }: Header.Props) => {
  return (
    <div className="flex flex-row items-center justify-between px-2 py-1">
      <div className="inline-flex items-center gap-2">
        {left}
        <nav className="flex gap-2">
          {links.map(({ href, label }) => {
            return (
              <Button asChild variant="ghost" key={href}>
                <Link href={href as any}>{label}</Link>
              </Button>
            )
          })}
        </nav>
      </div>
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
        {right}
      </div>
    </div>
  )
}

export default Header
