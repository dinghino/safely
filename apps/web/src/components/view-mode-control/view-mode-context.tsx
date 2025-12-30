'use client'

import { useState } from 'react'
import { List, Grid } from 'lucide-react'

import { createContext } from '@workspace/react-utils'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

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
    children: React.ReactNode
  }
}

const [Provider, useViewMode] = createContext<ViewMode.Value>()
export { useViewMode }

export const ViewModeProvider = (props: ViewMode.Props) => {
  const { children } = props
  const [mode, setMode] = useState<ViewMode.Mode>('list')
  return <Provider value={{ mode, setMode }}>{children}</Provider>
}

/**
 * ButtonGroup with a view mode menu to allow toggling view modes.
 * It shows current view and a dropdown button with other available views.
 */
export function ViewModeControl() {
  const { mode, setMode } = useViewMode()
  return (
    <ButtonGroup className="items-center">
      <p className="rounded-md border px-2 py-1.5 text-xs">{mode.toUpperCase()}</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {mode === 'list' ? <List /> : <Grid />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>View mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={mode === 'list'} onClick={() => setMode('list')}>
            <List />
            List
          </DropdownMenuItem>
          <DropdownMenuItem disabled={mode === 'grid'} onClick={() => setMode('grid')}>
            <Grid />
            Grid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
