'use client'

import type { Id } from '@workspace/backend/dataModel'
import { Button } from '@workspace/ui/components/button'
import {
  useActiveRequest,
  useActiveSession,
  useCreateRequest,
  useRemoveRequest,
} from '../hooks/session'
import { useTransition } from 'react'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { CircleXIcon } from 'lucide-react'
import type { TrackingRequestType } from '@workspace/backend/types'

export namespace SessionButton {
  export type Props = React.ComponentProps<typeof Button> & {
    deviceId: Id<'devices'>
  }
}

/**
 * A button to start or stop a tracking session on a device through requests.
 * Shows a cancel action if there is a request pending.
 */
export const SessionButton = (props: SessionButton.Props) => {
  const { deviceId, ...rest } = props
  const activeSession = useActiveSession(deviceId)

  return (
    <ButtonGroup>
      <MakeRequestButton
        deviceId={deviceId}
        requestType={activeSession ? 'stop' : 'start'}
        {...rest}
      >
        {activeSession ? 'Stop session' : 'Start session'}
      </MakeRequestButton>
      <CancelRequestButton deviceId={deviceId} {...rest} />
    </ButtonGroup>
  )
}

type MakeRequestButtonProps = {
  deviceId: Id<'devices'>
  requestType: TrackingRequestType
} & Omit<React.ComponentProps<typeof Button>, 'onClick'>

const MakeRequestButton = (props: MakeRequestButtonProps) => {
  const { deviceId, requestType, children = 'Request', ...rest } = props
  const createRequest = useCreateRequest()
  const currentRequest = useActiveRequest({ deviceId })

  const [loading, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await createRequest({ target: deviceId, type: requestType })
    })
  }

  const disabled = rest.disabled || loading || !!currentRequest

  return (
    <Button {...rest} disabled={disabled} onClick={handleClick}>
      {currentRequest ? 'Pending' : children}
    </Button>
  )
}

function CancelRequestButton(props: SessionButton.Props) {
  const { deviceId, ...rest } = props
  const remove = useRemoveRequest()
  const [loading, startTransition] = useTransition()
  const currentRequest = useActiveRequest({ deviceId })

  const handler = async () => {
    if (!currentRequest) return
    const { _id: requestId } = currentRequest
    startTransition(async () => {
      await remove({ requestId })
    })
  }

  if (!currentRequest) return null

  return (
    <Button
      variant="destructive"
      size="icon"
      {...rest}
      disabled={rest.disabled || !currentRequest || loading}
      onClick={handler}
    >
      <CircleXIcon />
    </Button>
  )
}
