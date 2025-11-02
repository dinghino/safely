import { useEffect, useId, useRef } from 'react'
import type { Subscription } from 'react-native-background-geolocation'

export class Listeners {
  // private listeners: Array<Subscription>
  private listeners: Map<string, Subscription>
  private _options: { debug: boolean; id: string }
  constructor(options?: { debug: boolean; id: string }) {
    this._options = options || { debug: false, id: 'bgl' }
    this.listeners = new Map()
  }
  setOptions(options: Partial<{ debug: boolean; id: string }>) {
    this._options = { ...this._options, ...options }
  }
  get options() {
    return this._options
  }
  push(name: string, sub: Subscription) {
    const fullName = `${name}-${this._options.id}`
    this.log(`Adding listener: ${fullName}`)
    this.listeners.set(fullName, sub)
  }
  clear() {
    const count = this.listeners.size
    this.listeners.forEach((_, name) => {
      this.remove(name)
    })
    this.listeners.clear()
    this.log(`Cleared all listeners (${count} removed)`)
    return count
    // this.listeners = []
  }
  remove(name: string) {
    const sub = this.listeners.get(name)
    if (!sub) return false
    this.log(`Removing ${name}`)
    sub.remove()
    return this.delete(name)
  }

  get length() {
    return this.listeners.size
  }
  get names() {
    return Array.from(this.listeners.keys())
  }
  get(name: string) {
    return this.listeners.get(name)
  }
  delete(name: string) {
    return this.listeners.delete(name)
  }
  private log(...args: any[]) {
    if (!this.options.debug) return
    console.log('🛰️ [BGL::listeners]', ...args)
  }
}

export function useListenersController(debug = false) {
  const id = useId()
  const subs = useRef<Listeners>(new Listeners({ debug, id }))

  useEffect(() => {
    subs.current.setOptions({ id })
  }, [id])

  const register = (name: string, sub: Subscription) => subs.current.push(name, sub)
  const unregister = (name: string) => subs.current.remove(name)
  const unregisterAll = () => subs.current.clear()

  return { register, unregister, unregisterAll, current: subs.current }
}
