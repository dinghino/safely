'use client'

import { useRef, useEffect } from 'react'

type PingOptions = {
  /** function to call every `intervalMs` time */
  func: () => Promise<void> | void
  /** interval timeout */
  intervalMs: number
  /** if true skips the first func call before starting the interval */
  skipFirst?: boolean
  /** disables the interval */
  enabled?: boolean
}

function cleanupInterval(ref: React.RefObject<NodeJS.Timeout | null>) {
  if (!ref.current) return
  clearInterval(ref.current)
  ref.current = null
}

/**
 * Conditionall call the given function every `intervalMs` time.
 * If `enabled` is false, the interval is not started.
 * If `skipFirst` is true, the function is not called immediately, but only after the first interval.
 */
export function useConditionalInterval(opts: PingOptions) {
  const { intervalMs, func, enabled = true, skipFirst = false } = opts
  const state = useRef<'IDLE' | 'RUNNING'>('IDLE')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const callback = useRef(func)

  useEffect(() => {
    callback.current = func
  }, [func])

  useEffect(() => {
    // Clear any existing interval
    cleanupInterval(intervalRef)

    // Don't start if disabled or no device
    if (!enabled) return
    if (!callback.current) return
    if (state.current === 'RUNNING') return

    async function handler() {
      state.current = 'RUNNING'
      await callback.current()
      state.current = 'IDLE'
    }
    // Send initial heartbeat
    if (!skipFirst) handler()

    intervalRef.current = setInterval(handler, intervalMs)
    return () => cleanupInterval(intervalRef)
  }, [enabled, intervalMs, skipFirst])
}
