import { useEffect, useState } from 'react'

export type UseTimer = { tick?: number; enabled?: boolean }
export const useTimer = ({ tick = 1000, enabled = true }: UseTimer) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => {
      setNow(Date.now())
    }, tick)
    return () => clearInterval(interval)
  }, [tick, enabled])

  return now
}
