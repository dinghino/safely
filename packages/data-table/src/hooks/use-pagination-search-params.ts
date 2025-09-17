import { parseAsIndex, parseAsInteger, useQueryStates } from '@safely/nuqs'

type PaginationDefaults = {
  pageIndex?: number
  pageSize?: number
}

const paginationParsers = ({ pageIndex = 0, pageSize = 10 }: PaginationDefaults = {}) => ({
  pageIndex: parseAsIndex.withDefault(pageIndex),
  pageSize: parseAsInteger.withDefault(pageSize),
})
const paginationUrlKeys = (base?: string) => ({
  pageIndex: base ? `${base}.page` : 'page',
  pageSize: base ? `${base}.limit` : 'limit',
})

export type PaginationOptions = {
  /**
   * base key for pagination params.
   * allows for multiple pagination params to exist in the URL
   */
  base?: string
  defaults?: PaginationDefaults
}

/**
 * Custom hook to manage pagination state using URL query parameters.
 * @returns `[state, setter]` slice of pagination state based on options.base
 */
export function usePaginationSearchParams({ base, defaults }: PaginationOptions = {}) {
  return useQueryStates(paginationParsers(defaults), { urlKeys: paginationUrlKeys(base) })
}
