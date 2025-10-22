'use client'

import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/types'

import { DeleteDialogButton } from '@workspace/ui/components/delete-dialog-button'

export namespace DeleteSessionButton {
  export type Props = {
    session: { _id: Id<'trackSession'>; endedAt?: number }
  } & Omit<DeleteDialogButton.Props, 'onClick'>
}

export const DeleteSessionButton: React.FC<DeleteSessionButton.Props> = ({ session, ...rest }) => {
  const deleteSession = useMutation(api.tracking.sessions.remove)

  return (
    <DeleteDialogButton
      title="Delete Session"
      description="Are you sure you want to delete this session? This action cannot be undone."
      confirmText="Delete"
      className="cursor-pointer"
      {...rest}
      disabled={rest.disabled || session.endedAt === undefined}
      onClick={async () => {
        await deleteSession({ sessionId: session._id })
      }}
    />
  )
}
