'use client'

import type { Id } from '@workspace/backend/dataModel'
import { Button } from '@workspace/ui/components/button'
import { useActiveSession, useStartSession, useStopSession } from '../hooks'
import { PauseIcon, PlayIcon } from 'lucide-react'

export namespace SessionButton {
  export type Props = React.ComponentProps<typeof Button> & {
    deviceId: Id<'devices'>
  }
}

/**
 * Handles starting and stopping tracking sessions for a device.
 */
export const SessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const activeSession = useActiveSession(deviceId)
  const startSession = useStartSession()
  const endSession = useStopSession()

  const text = activeSession ? 'End Session' : 'Start Session'

  const handleClick = async () => {
    if (activeSession) {
      await endSession(activeSession)
    } else {
      await startSession({ _id: deviceId })
    }
  }

  const Icon = activeSession ? PauseIcon : PlayIcon

  return (
    <Button variant={activeSession ? 'destructive' : 'default'} {...rest} onClick={handleClick}>
      {props.children ?? (
        <>
          <span className="max-md:sr-only">{text}</span> <Icon />
        </>
      )}
    </Button>
  )
}
