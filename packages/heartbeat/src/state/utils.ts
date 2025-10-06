import type { Heartbeat } from "./types"

export const isStalePosition = (context: Heartbeat.Context) => {
  const { position, interval } = context

  if (!position) return true
  const { timestamp } = position
  if (timestamp <= 0) return true
  const age = Date.now() - timestamp
  // give it some slack so we can dispatch the location retrieved on the previous
  // round if it took too long to get it for that heartbeat.
  const maxAge = interval * 1.5
  return age >= maxAge
}
