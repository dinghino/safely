'use client'

import { Button } from '@workspace/ui/components/button'
import { useDeviceContext } from '../contexts'

export namespace RegisterButton {
  export type Props = Omit<React.ComponentProps<typeof Button>, 'children' | 'onClick'>
}

export const RegisterDeviceButton = (props: RegisterButton.Props) => {
  const { registerDevice, canRegister } = useDeviceContext()

  if (!canRegister) return null

  return (
    <Button {...props} onClick={registerDevice} disabled={!canRegister || props.disabled}>
      Register Device
    </Button>
  )
}
