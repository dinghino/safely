import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export namespace SmallWidget {
  export type Props = {
    icon: LucideIcon
    label: string
    children: React.ReactNode
    layout?: 'vertical' | 'horizontal'
  }
}

/**
 * A small generic wrapper to create
 * widgets with an icon, a label, and some content.
 */
export const SmallWidget = (props: SmallWidget.Props) => {
  const { icon: Icon, label, children, layout = 'horizontal' } = props
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md p-2',
        'border border-muted-foreground/10 bg-muted/75',
        isVertical(layout) ? 'flex-col' : 'flex-row',
      )}
    >
      <Icon className="size-6 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span>{children}</span>
      </div>
    </div>
  )
}

function isVertical(layout: SmallWidget.Props['layout']) {
  return layout === 'vertical'
}
