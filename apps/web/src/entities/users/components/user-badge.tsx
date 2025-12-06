import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { tv, type VariantProps } from 'tailwind-variants'

const variants = tv({
  slots: {
    badge: 'pl-0.5 font-bold',
  },
  variants: {
    rounded: {
      true: {
        badge: 'rounded-full',
      },
      false: {
        badge: 'rounded-sm',
      },
    },
  },
  defaultVariants: {
    rounded: true,
  },
})

export namespace UserBadge {
  export type User = {
    _id: string // Id<'users'>
    username: string | undefined
    image: string | undefined
  }
  type BadgeProps = Omit<React.ComponentProps<typeof Badge>, 'children'>
  type Variants = VariantProps<typeof variants>

  export type Props = Variants &
    BadgeProps & {
      user: User
      className?: string
    }
}

export const UserBadge = ({ user, ...rest }: UserBadge.Props) => {
  const { rounded, ...props } = rest
  const cls = variants({ rounded })
  return (
    <Badge
      key={user._id}
      className={cn(cls.badge(), props.className)}
      variant={props.variant ?? 'outline'}
      {...props}
    >
      <Avatar key={user._id} className="size-4">
        <AvatarImage src={user.image} alt={`@${user.username}`} />
        <AvatarFallback>{user.username?.charAt(0).toUpperCase() ?? 'User'}</AvatarFallback>
      </Avatar>
      {user.username}
    </Badge>
  )
}
