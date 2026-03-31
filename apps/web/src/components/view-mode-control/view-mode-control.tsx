'use client'

import { LayoutGridIcon, LayoutListIcon } from 'lucide-react'


import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useViewMode } from './view-mode-context'


/**
 * ButtonGroup with a view mode menu to allow toggling view modes.
 * It shows current view and a dropdown button with other available views.
 */
export function ViewModeControl() {
  const { mode, setMode } = useViewMode()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {mode === 'list' ? <LayoutListIcon /> : <LayoutGridIcon />}
          {mode}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>View mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={mode === 'list'} onClick={() => setMode('list')}>
          <LayoutListIcon />
          List
        </DropdownMenuItem>
        <DropdownMenuItem disabled={mode === 'grid'} onClick={() => setMode('grid')}>
          <LayoutGridIcon />
          Grid
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
