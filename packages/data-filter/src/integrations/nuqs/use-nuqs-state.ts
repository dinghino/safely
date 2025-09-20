import z from 'zod/v4'
import { parseAsJson, useQueryState } from 'nuqs'
import type { FiltersState } from '../../core/types'

const filtersSchema = z.custom<FiltersState>()

export type FilterSearchOptions = {
  /**
   * SearchParams key to store the filters state
   * @default 'filters'
   */
  key?: string
  /**
   * Custom zod schema to validate the filters state.
   * Allows you to pass a shape compliant schema for complex filters that you
   * need to validate.
   * @default z.custom<FiltersState>()
   */
  schema?: z.ZodType<FiltersState>
}

export function useFilterSearchParams(options: FilterSearchOptions = {}) {
  const { key = 'filters', schema = filtersSchema } = options

  return useQueryState<FiltersState>(key, parseAsJson(schema.parse).withDefault([]))
}
