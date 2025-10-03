import { useEffect, useState } from 'react'
import * as store from '@/lib/secure-store'

export type UseStoreOptions<T> = {
  key: string
  loader?: (value: string) => T
  transformer?: (value: T) => string
  defaultValue?: T
}

function defaultLoader<T>(value: string): T {
  return value as unknown as T
}
function defaultTransformer<T>(value: T): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function useSecureStore<T>(options: UseStoreOptions<T>) {
  const {
    key,
    loader = defaultLoader,
    transformer = defaultTransformer,
    defaultValue = undefined,
  } = options

  const [value, setValue] = useState<T | undefined>(defaultValue)

  useEffect(() => {
    store.load({ key, defaultValue, parser: loader }).then(
      (v) => v && setValue(v as T),
      (e) => console.error('Failed to load deviceId from secure store', e),
    )
  }, [defaultValue, key, loader])

  const save = async (newValue: T) => {
    await store.save('key', transformer(newValue))
    setValue(newValue)
  }

  return [value, save] as const
}
