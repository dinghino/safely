import { cn } from '@workspace/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const wireframeVariants = cva('relative isolate rounded-sm shadow-md outline outline-border/20', {
  variants: {
    type: {
      view: 'bg-red-200/20',
      widget: 'bg-blue-200/20',
      component: 'bg-green-200/20',
    },
  },
  defaultVariants: {
    type: 'component',
  },
})

export namespace Wireframe {
  export type Props = {
    className?: string
    children?: React.ReactNode
    title?: string
  } & VariantProps<typeof wireframeVariants>
}

export const Wireframe = (props: Wireframe.Props) => {
  const { className, children, title, ...rest } = props
  return (
    <div className={cn(className, wireframeVariants(rest), 'hover:[&>h2]:opacity-100')}>
      {title && (
        <h2
          className={cn(
            'absolute top-0 left-0 rounded bg-muted p-0.5 font-mono text-[0.5rem]',
            'opacity-25 transition-opacity',
            'z-30'
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
