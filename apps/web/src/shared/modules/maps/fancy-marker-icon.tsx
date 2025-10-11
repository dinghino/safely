import { cn } from '@/lib/utils'

/**
 * Wrapper for custom `icon` component for `MapMarker` to give a pin-like appearance
 * to its children that are the actual icon content.  
 */
export const FancyMarkerIcon = (props: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        'relative isolate aspect-square min-w-fit bg-background text-foreground',
        'rounded-full',
        'before:-bottom-3 before:-translate-x-1/2 before:absolute before:left-1/2',
        'before:border-8 before:border-x-transparent before:border-t-background before:border-b-transparent',
        'before:-z-1',
        'shadow-xl',
        '-translate-y-3',
        'transition-all',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
