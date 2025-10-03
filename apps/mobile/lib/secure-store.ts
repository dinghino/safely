import * as SecureStore from 'expo-secure-store'

export async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value)
}

type GetValueOptions<T> = {
  key: string
  parser?: (value: string) => T
  defaultValue?: T
}
export async function load<T>(options: GetValueOptions<T>): Promise<T | undefined> {
  const { key, parser = (v) => v as T, defaultValue = undefined } = options
  const result = await SecureStore.getItemAsync(key)
  return result ? parser(result) : defaultValue
}
