import { useMemo, useRef } from 'react'

export const useThrottle = <F extends Function>(cb: F, limitMs: number): (() => void) => {
  const lastRan = useRef<number>(Date.now())
  return useMemo(() => {
    const throttledFunction = async () => {
      if (Date.now() - lastRan.current >= limitMs) {
        lastRan.current = Date.now()
        return await cb()
      }
    }
    return throttledFunction
  }, [cb, limitMs])
}
