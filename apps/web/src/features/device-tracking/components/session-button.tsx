'use client'

import type { Id } from '@workspace/backend/dataModel'
import { Button } from '@workspace/ui/components/button'
import { useActiveSession, useStartSession, useStopSession } from '../hooks/session'
import { useSessionManager } from '../contexts'
import { useDeviceContext } from '@/features/device-manager'


export namespace SessionButton {
  export type Props = React.ComponentProps<typeof Button> & {
    deviceId: Id<'devices'>
  }
}

export const SessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const activeSession = useActiveSession(deviceId)

  if (activeSession) {
    return <StopSessionButton deviceId={deviceId} {...rest} />
  }
  return <StartSessionButton deviceId={deviceId} {...rest} />
}

const StartSessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const { device: thisDevice } = useDeviceContext()
  const { start } = useSessionManager()
  const requestStart = useStartSession()

  const handleClick = async () => {
    if (thisDevice?._id === deviceId) {
      console.log('starting session for this device')
      // starting for this device - just notify context
      return start()
    }
    await requestStart({ deviceId })
  }

  return (
    <Button {...rest} onClick={handleClick}>
      Start session
    </Button>
  )
}

const StopSessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const { device: thisDevice } = useDeviceContext()
  const activeSession = useActiveSession(deviceId)
  const { stop } = useSessionManager()
  const endSession = useStopSession()

  const handleClick = async () => {
    if (!activeSession) return
    // if we are stopping for this device just notify the context
    if (activeSession.device === thisDevice?._id) {
      console.log('stopping session for this device')
      return stop()
    }
    // otherwise ask the server to close the session for the device
    await endSession({ sessionId: activeSession._id })
  }

  return (
    <Button {...rest} onClick={handleClick} disabled={!activeSession}>
      End session
    </Button>
  )
}
