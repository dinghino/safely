'use client'

import { PlusIcon, MinusIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'

import { cn } from '@/lib/utils'
import { useZoomControls, type ZoomState } from '../hooks/use-zoom-controls'

type GroupProps = React.ComponentProps<typeof ButtonGroup>
type ButtonProps = React.ComponentProps<typeof Button>

export namespace ZoomControls {
  export type Props = {
    className?: string
    orientation?: GroupProps['orientation']
    size?: ButtonProps['size']
    variant?: ButtonProps['variant']
  }
  export type State = ZoomState
}

/**
 * Custom zoom controls using shadcn elements to keep UI consistent.
 * @note this is web only - cannot be ported directly to react-native due to onClick/onPress
 * differences
 */
export function ZoomControls(props: ZoomControls.Props) {
  const { className, orientation = 'vertical', size = 'sm', variant = 'outline' } = props
  const zoom = useZoomControls()

  return (
    <ButtonGroup orientation={orientation} className={cn('leaflet-control', className)}>
      <Button
        size={size}
        variant={variant}
        onClick={() => zoom.increase()}
        title="Zoom in"
        disabled={!zoom.canZoomIn}
      >
        <PlusIcon />
      </Button>
      <Button
        size={size}
        variant={variant}
        onClick={() => zoom.decrease()}
        title="Zoom out"
        disabled={!zoom.canZoomOut}
      >
        <MinusIcon />
      </Button>
    </ButtonGroup>
  )
}
