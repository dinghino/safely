'use client'

import { createContext } from '@workspace/react-utils'

import { useLocalStorage } from '@/shared/hooks/use-local-storage'

/**
 * A context controller for toggling view modes
 */
export namespace ViewMode {
  export type Mode = 'list' | 'grid'
  export type Value = {
    mode: Mode
    setMode: (mode: Mode) => void
  }
  export type Props = {
    defaultMode?: Mode
    storageKey?: string
    children: React.ReactNode
  }
}

const [Provider, useViewMode] = createContext<ViewMode.Value>()
export { useViewMode }

export const ViewModeProvider = (props: ViewMode.Props) => {
  const { children, storageKey = 'view-mode', defaultMode = 'list' } = props
  const [mode, setMode] = useLocalStorage<ViewMode.Mode>({
    key: storageKey,
    defaultValue: defaultMode
  })
  return <Provider value={{ mode, setMode }}>{children}</Provider>
}
