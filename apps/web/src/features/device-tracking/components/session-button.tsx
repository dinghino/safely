'use client'

import type { Id } from '@workspace/backend/dataModel'
import { Button } from '@workspace/ui/components/button'
import { useActiveSession, useStartSession, useStopSession } from '../hooks/session'

export namespace SessionButton {
  export type Props = React.ComponentProps<typeof Button> & {
    deviceId: Id<'devices'>
  }
}

export const SessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const activeSession = useActiveSession(deviceId)
  const startSession = useStartSession()
  const endSession = useStopSession()

  const text = activeSession ? 'End Session' : 'Start Session'

  const handleClick = async () => {
    if (activeSession) {
      await endSession({ sessionId: activeSession._id })
    } else {
      await startSession({ deviceId })
    }
  }

  return (
    <Button {...rest} onClick={handleClick}>
      {text}
    </Button>
  )
}
