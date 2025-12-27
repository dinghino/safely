import type { Id } from '@workspace/backend/types'
import { parseAsString } from '@workspace/nuqs'

export { cn } from '@workspace/ui/lib/utils'

/**
 * Custom nuqs parser for Convex IDs to maintain type safety
 */
export const parseAsId = <T extends Id<any>>() =>
  parseAsString as unknown as {
    parse: (value: string) => T | null
    serialize: (value: T) => string
  }
