import { api } from '@workspace/backend/api'
import { useMutation, useQuery } from 'convex/react'
import { useDeviceContext } from './contexts/device-manager'
import { Button } from './ui/button'
import { Text } from './ui/text'

type SessionButtonProps = Omit<React.ComponentProps<typeof Button>, 'onPress'>

/**
 * Button to start a tracking session for the current device.
 */
export function StartSessionButton(props: SessionButtonProps) {
  const { device } = useDeviceContext()
  const startSession = useMutation(api.tracking.requests.create)

  const handleStartSession = async () => {
    if (!device) return
    await startSession({ from: device._id, target: device._id, type: 'start' })
  }

  return (
    <Button onPress={handleStartSession} {...props}>
      {props.children}
    </Button>
  )
}

export function StopSessionButton(props: SessionButtonProps) {
  const { device } = useDeviceContext()
  const stopSession = useMutation(api.tracking.requests.create)

  const handleStopSession = async () => {
    if (!device) return
    await stopSession({ from: device._id, target: device._id, type: 'stop' })
  }

  return (
    <Button onPress={handleStopSession} {...props}>
      {props.children}
    </Button>
  )
}

export function SessionButton(props: SessionButtonProps) {
  const { device } = useDeviceContext()
  const current = useQuery(api.tracking.sessions.getActive, { deviceId: device?._id })

  if (!device) return null

  if (current)
    return (
      <StopSessionButton variant="destructive" {...props}>
        {props.children ?? <Text>Stop Session</Text>}
      </StopSessionButton>
    )
  return (
    <StartSessionButton variant="default" {...props}>
      {props.children ?? <Text>Start Session</Text>}
    </StartSessionButton>
  )
}

export default SessionButton
