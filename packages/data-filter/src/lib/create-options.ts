import type { ColumnOption } from '../core/types'
export function createOptions<T>(values: T[], fn: (v: T) => ColumnOption) {
  return values.map((item, i) => ({ key: i, ...fn(item) }))
}
