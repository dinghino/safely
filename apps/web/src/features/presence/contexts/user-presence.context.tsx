'use client'
import { useUser } from '@clerk/nextjs'
// import { useUser } from '@clerk/nextjs'

import { api } from '@workspace/backend/api'
import { usePresence } from '@workspace/backend/react'
import { createContext } from '@workspace/react-utils'
import { useEffect, useState } from 'react'

type PresenceState = ReturnType<typeof usePresence>

export type PresenceContext = {
  state: PresenceState | null
  roomId: string
}

const [Provider, useUserPresenceContext] = createContext<PresenceContext>('PresenceContext')

export { useUserPresenceContext }

export namespace UserPresenceProvider {
  export type Props = {
    roomId?: string
    children: React.ReactNode
  }
}

export const UserPresenceProvider: React.FC<UserPresenceProvider.Props> = (props) => {
  const { children, roomId = 'app' } = props
  const { user } = useUser()
  const [userPresence, setUserPresence] = useState<PresenceState | null>(null)

  const value = { state: userPresence, roomId }

  return (
    <Provider value={value}>
      {user && <UserPresenceHandler user={user} roomId={roomId} onChange={setUserPresence} />}
      {children}
    </Provider>
  )
}

type UserPresenceHandlerProps = {
  user: { id: string }
  onChange: (state: PresenceState | null) => void
  roomId: string
}

function UserPresenceHandler({ user, onChange, roomId }: UserPresenceHandlerProps) {
  const state = usePresence(api.presence, roomId, user.id, 30_000)

  useEffect(() => onChange(state), [state, onChange])

  return null
}
