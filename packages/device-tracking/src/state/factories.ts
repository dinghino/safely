/**
 * File contains easy to use factories to create actor overrides for the
 * device tracking state machine.
 */

import { fromPromise } from 'xstate'
import type { Id } from '@workspace/backend/dataModel'
import type { Geolocator, Tracking } from '../types'

type Data = Omit<Geolocator.Data, 'timestamp'>
// type SenderOptions = Expand<{ sessionId: Id<'trackSession'> } & Omit<Geolocator.Data, 'timestamp'>>
type SenderOptions = { sessionId: Id<'trackSession'> } & Data
type Sender = (opts: SenderOptions) => Promise<unknown>

function _createSender(sendPosition: Sender): Tracking.Actors['sendPosition'] {
  return fromPromise(async ({ input }) => {
    const { timestamp, ...data } = input
    await sendPosition(data)
  })
}

/**
 * Typed factory to create a parser from an unknown type to get the settings
 * for the tracking machine.
 * @usage
 * ```ts
 * const parser = createSettingsFactory<InputType>((input) => ({
 *   interval: input.updateIntervalMs ?? DEFAULT_INTERVAL,
 *   trackingMode: input.trackingMode ?? 'off',
 * }))
 */
export function createSettingsFactory<T>(cb: (source: T) => Tracking.Settings): typeof cb {
  return (data: T): Tracking.Settings => cb(data)
}
