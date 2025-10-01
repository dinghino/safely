'use client'
import { useEffect } from 'react'

type EventName = keyof WindowEventMap | (string & {})

type Listener<
  K extends EventName,
  CE extends CustomEvent = CustomEvent,
> = K extends keyof WindowEventMap
  ? (this: Window, ev: WindowEventMap[K]) => void
  : (this: Window, ev: CE) => void

export function useWindowEvent<K extends EventName>(
  type: K,
  listener: Listener<K>,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    const wrappedListener = (ev: Event) => {
      // biome-ignore lint/suspicious/noExplicitAny: ???
      listener.call(window, ev as any)
    }
    window.addEventListener(type, wrappedListener, options)
    return () => window.removeEventListener(type, wrappedListener, options)
  }, [type, listener, options])
}
