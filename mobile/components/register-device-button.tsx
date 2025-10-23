import { useDeviceContext } from './contexts/device-manager'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function RegisterDeviceButton(props: Omit<React.ComponentProps<typeof Button>, 'onPress'>) {
  const { isRegistered, register } = useDeviceContext()

  if (isRegistered) return null

  return (
    <Button {...props} onPress={register}>
      <Text>Register Device</Text>
    </Button>
  )
}
