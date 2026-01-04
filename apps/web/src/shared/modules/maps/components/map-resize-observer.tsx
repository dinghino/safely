'use client'

import { useMap } from 'react-leaflet/hooks'
import { useRef, useEffect } from 'react'

export namespace MapResizeObserver {
  export type Props = {
    delay?: number
  }
}

/**
 * Invalidates the containing map's size when its container resizes with a debounce.
 */
export function MapResizeObserver({ delay = 100 }: MapResizeObserver.Props) {
  const map = useMap()
  const container = map.getContainer()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        map.invalidateSize()
      }, delay)
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [map, container, delay])

  return null
}
