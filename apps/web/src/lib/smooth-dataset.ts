export type SmoothDataSetOptions<T, K extends keyof T> = {
  /**
   * The size of the moving window to use for smoothing.
   */
  windowSize: number
  data: T[]
  /**
   * The key of the property to smooth
   */
  key: K
  /**
   * Function to extract the numeric value from the item.
   * If not provided, the value at the key is used directly (must be a number).
   */
  extractor?: (item: T) => number
}

/**
 * Smooths data using a moving window average.
 * Returns the same type as the input with the specified key's value replaced with the smoothed value.
 *
 * @example
 * ```ts
 * const data = [{ speed: 10 }, { speed: 20 }, { speed: 30 }]
 * const smoothed = smoothData({ windowSize: 3, data, key: 'speed' })
 * // Returns: [{ speed: 15 }, { speed: 20 }, { speed: 25 }]
 * ```
 */
export function smoothData<T, K extends keyof T>(options: SmoothDataSetOptions<T, K>): T[] {
  const { windowSize, data, key, extractor } = options

  const getValue = extractor || ((item: T) => item[key] as number)

  const smoothedData: Array<T> = data.map((item, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2))
    const end = Math.min(data.length, index + Math.ceil(windowSize / 2))
    const window = data.slice(start, end)
    const average = window.reduce((sum, point) => sum + getValue(point), 0) / window.length
    return { ...item, [key]: average } as T
  })
  return smoothedData
}
