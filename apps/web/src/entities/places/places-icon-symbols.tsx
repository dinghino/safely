'use client'

import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useMemo } from 'react'

export type PoiIconSymbolsProps = {
  names: string[]
}

/**
 * Renders a hidden SVG container with <symbol> definitions for Lucide icons.
 * This "warms up" the icons in the normal React lifecycle and makes them
 * available for static <use href="#poi-icon-name" /> references in Map Markers.
 */
export function PoiIconSymbols({ names }: PoiIconSymbolsProps) {
  const uniqueNames = useMemo(() => Array.from(new Set(names)), [names])

  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
      <defs>
        {uniqueNames.map((name) => (
          <SymbolWrapper key={name} name={name} />
        ))}
      </defs>
    </svg>
  )
}

function SymbolWrapper({ name }: { name: string }) {
  // We use a custom id so we can reference it via <use href="#poi-icon-..." />
  return (
    <symbol id={`poi-icon-${name}`} viewBox="0 0 24 24">
      <DynamicIcon name={name as IconName} />
    </symbol>
  )
}
