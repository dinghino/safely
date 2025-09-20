import { useIsMobile } from '@workspace/ui/hooks/use-mobile'
import { ActiveFilters, ActiveFiltersMobileContainer } from './active-filters'
import { FilterActions } from './filter-actions'
import { FilterSelector } from './filter-selector'

import { type DataFilterContextValue, DataFilter as Provider } from './data-filter.context'
import type { Locale } from '../lib/i18n'

export type DataTableFilterProps<TData> = Omit<DataFilterContextValue<TData>, 'locale'> & {
  locale?: Locale
}

/**
 * Standalone drop-in solution to add filter capabilities.
 * If more complex layouts are needed, consider using the context and individual
 * components to handle filtering.
 */
export const DataTableFilter = <TData,>(props: DataTableFilterProps<TData>) => {
  const isMobile = useIsMobile()

  return (
    <Provider {...props}>
      {isMobile ? (
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex gap-1">
            <FilterSelector />
            <FilterActions />
          </div>
          <ActiveFiltersMobileContainer>
            <ActiveFilters />
          </ActiveFiltersMobileContainer>
        </div>
      ) : (
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex w-full flex-1 gap-2 md:flex-wrap">
            <FilterSelector />
            <ActiveFilters />
          </div>
          <FilterActions />
        </div>
      )}
    </Provider>
  )
}
