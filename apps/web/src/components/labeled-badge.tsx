'use client'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Badge } from '@workspace/ui/components/badge'

export namespace LabeledBadge {
  type Variants = React.ComponentProps<typeof Badge>['variant']
  export type Props = {
    label?: React.ReactNode
    children: React.ReactNode
    variants?: {
      label?: Variants
      value?: Variants
    }
  }
}

export const LabeledBadge: React.FC<LabeledBadge.Props> = (props) => {
  const { label, children, variants } = props

  return (
    <ButtonGroup>
      <Badge variant={variants?.label ?? 'outline'}>{label}</Badge>
      <Badge variant={variants?.value}>{children}</Badge>
    </ButtonGroup>
  )
}
