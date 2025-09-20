import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { FilterXIcon } from 'lucide-react'
import { memo } from 'react'
import { t } from '../lib/i18n'
import { useDataFilterContext } from './data-filter.context'

export const FilterActions = memo(FilterActions__Internal)

function FilterActions__Internal() {
  const { actions, locale, filters } = useDataFilterContext()
  const hasFilters = filters.length > 0
  return (
    <Button
      className={cn('!px-2 h-7', !hasFilters && 'hidden')}
      variant="destructive"
      onClick={actions?.removeAllFilters}
    >
      <FilterXIcon />
      <span className="hidden md:block">{t('clear', locale)}</span>
    </Button>
  )
}
