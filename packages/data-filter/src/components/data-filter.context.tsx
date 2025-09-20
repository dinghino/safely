'use client'
import { createContext, useContext, type ReactNode } from 'react'
import type { Column, DataTableFilterActions, FiltersState, FilterStrategy } from '../core/types'
import type { Locale } from '../lib/i18n'

// Generic context type
export type DataFilterContextValue<TData> = {
  columns: Column<TData>[]
  filters: FiltersState
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale: Locale
}

// Create a generic context (default to unknown)
const DataFilterContext = createContext<DataFilterContextValue<unknown>>(
  {} as DataFilterContextValue<unknown>,
)

// Generic context hook

export function useDataFilterContext<TData = unknown>() {
  // Cast context value to generic type
  return useContext(DataFilterContext) as DataFilterContextValue<TData>
}

// Generic provider component

export function DataFilter<TData>(props: DataFilter.Props<TData>) {
  const { children, locale = 'en', ...rest } = props
  const value = { ...rest, locale } as DataFilterContextValue<unknown>
  return <DataFilterContext.Provider value={value}>{children}</DataFilterContext.Provider>
}

// Namespace for types
export namespace DataFilter {
  export type Props<TData> = Omit<DataFilterContextValue<TData>, 'locale'> & {
    children: ReactNode
    locale?: Locale
  }
}
