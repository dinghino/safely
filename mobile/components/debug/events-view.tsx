import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { type Geolocation, useGeolocation } from '@/components/contexts/geolocation'

import { Trigger } from './collapse-button'

type ContextValue = {
  active: string[]
  toggle: (name: string) => void
  set: (name: string, value: boolean) => void
  all: (enabled: boolean) => void
  names: string[]
}
const initialFilterState: ContextValue = {
  active: [],
  names: [],
  toggle: () => {},
  set: () => {},
  all: () => {},
}

export const FilterContext = createContext<ContextValue>(initialFilterState)

export function useEventsFilterContext() {
  return useContext(FilterContext)
}

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { events } = useGeolocation()

  const _map = useRef(new Map<string, boolean>())
  const [active, setActive] = useState<string[]>([])

  const names = useMemo(() => {
    const uniqueNames = Array.from(new Set(events.map((e) => e.name)))
    return uniqueNames.sort()
  }, [events])

  const toggle = useCallback((name: string) => {
    _map.current.set(name, !_map.current.get(name))
    setActive((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }, [])

  // when new events arrive, ensure their names are in the active map and true by default
  useEffect(() => {
    events.forEach((e) => {
      if (!_map.current.has(e.name)) {
        _map.current.set(e.name, true)
        setActive((prev) => [...prev, e.name])
      }
    })
  }, [events])

  const set = useCallback((name: string, value: boolean) => {
    _map.current.set(name, value)
    setActive((prev) => {
      if (value) {
        return prev.includes(name) ? prev : [...prev, name]
      }
      // remove from active
      return prev.filter((n) => n !== name)
    })
  }, [])

  const all = useCallback(
    (enabled: boolean) => {
      names.forEach((name) => {
        _map.current.set(name, enabled)
      })
      setActive(enabled ? [...names] : [])
    },
    [names],
  )
  const value = useMemo(
    () => ({ active, toggle, names, set, all }),
    [active, toggle, names, set, all],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function EventCard({ event }: { event: Geolocation.Event }) {
  const title = useMemo(() => {
    switch (true) {
      case event.name.includes('📍 location'):
        return `${event.name} (source: ${event.data.event!})`
      default:
        return event.name
    }
  }, [event])
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          <View className="flex flex-row justify-between gap-4">
            <Text className="flex-1">{title}</Text>
            <Text className="text-muted-foreground">{formatTimestamp(event.timestamp)}</Text>
          </View>
        </Trigger>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="py-4">
          <CardContent className="px-4">
            <Text className="text-xs">{JSON.stringify(event.data, null, 2)}</Text>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

// format timestamp in HH:MM:SS.mmmm with damn milliseconds
function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}
