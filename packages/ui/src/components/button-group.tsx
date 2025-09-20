import { cn } from '@workspace/ui/lib/utils'

export type ButtonGroupProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Custom wrapper to create a styled button group.
 * This is meant to be used with `Button` but works with most other type of
 * components
 */
export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'flex flex-row gap-0',
        // handle first item - resetleft
        '*:first-of-type:not-last:rounded-tr-none *:first-of-type:not-last:rounded-br-none *:first-of-type:not-last:border-r-0',
        // handle last item - resetright
        '*:last-of-type:not-first:rounded-tl-none *:last-of-type:not-first:rounded-bl-none',
        // handle middle items - reset all
        '*:not-first:not-last:rounded-none *:not-first:not-last:border-r-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
