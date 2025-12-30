'use client'

import { Star } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'

import { usePlace, PlaceProvider } from '../place-context'
import type { Place } from '@/entities/places/types'

// Mock type extension for UI development until backend catches up
type EnhancedPlace = Place & {
  photos?: string[]
  rating?: number
  reviewCount?: number
}

export namespace PlaceCard {
  export type Props = {
    place: Place
    className?: string
    children?: React.ReactNode
    onClick?: () => void
  }
}

export const PlaceCardRoot = ({ place, className, children, onClick }: PlaceCard.Props) => {
  return (
    <PlaceProvider place={place}>
      <Card
        className={cn('group overflow-hidden transition-all hover:shadow-md', className)}
        onClick={onClick}
      >
        {children}
      </Card>
    </PlaceProvider>
  )
}

export const PlaceCardThumbnail = ({ className }: { className?: string }) => {
  const place = usePlace() as EnhancedPlace
  const { photos, name } = place
  // todo: use a proper placeholder
  const src = photos?.[0] ?? '/placeholder.png'

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-muted', className)}>
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
    </div>
  )
}

export const PlaceCardTitle = ({ className }: { className?: string }) => {
  const { name } = usePlace()
  return <h3 className={cn('font-semibold text-lg leading-tight', className)}>{name}</h3>
}

export const PlaceCardRating = ({ className }: { className?: string }) => {
  const place = usePlace() as EnhancedPlace
  const { reviewCount, rating } = place

  if (!rating) return null

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <span className="flex items-center gap-0.5 font-medium text-amber-500">
        {rating} <Star className="size-3 fill-amber-500 text-amber-500" />
      </span>
      <span className="text-muted-foreground">({reviewCount})</span>
    </div>
  )
}

export const PlaceCardContent = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return <div className={cn('p-4', className)}>{children}</div>
}

type ActionProps = {
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  className?: string
}

export const PlaceCardAction = ({
  onClick,
  children,
  variant = 'secondary',
  className,
}: ActionProps) => {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn('h-8', className)}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        onClick?.(e)
      }}
    >
      {children}
    </Button>
  )
}

export const PlaceCardFooter = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div className={cn('flex items-center justify-between border-t bg-muted/20 p-3', className)}>
      {children}
    </div>
  )
}

/**
 * A ready-to-use Place Card with standard layout.
 * Use subcomponents for custom layouts.
 */
export const PlaceCard = (props: PlaceCard.Props) => {
  return (
    <PlaceCardRoot {...props}>
      <PlaceCardThumbnail />
      <PlaceCardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <PlaceCardTitle />
          <PlaceCardRating />
        </div>
        {/* We could add generic tags or address here if available in Place type */}
      </PlaceCardContent>
      {/* <div className="flex items-center justify-between border-t p-3 bg-muted/20">
         <PlaceCardAction>Details</PlaceCardAction>
      </div> */}
    </PlaceCardRoot>
  )
}
