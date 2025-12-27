import { useState, useMemo } from 'react'
import { usePaginatedQuery, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'
import { cn } from '@/lib/utils'

import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Spinner } from '@workspace/ui/components/spinner'

import { CategoryIcon } from '@/entities/poi/categories'
import { CategorySelect } from '@/entities/poi/category-select'
import type { Id } from '@workspace/backend/dataModel'

export namespace PoisList {
  export type Props = {
    className?: string
    perPage?: number
  }
}
/**
 * Simple paginated list that shows all POIs with a paginated query and a local
 * search filter
 */
export function PoisList({ className, perPage = 500 }: PoisList.Props) {
  const categories = useQuery(api.pois.categories.all)
  const [selectedCategory, setCategory] = useState<Id<'poiCategory'> | undefined>(undefined)

  const { loadMore, results, isLoading, status } = usePaginatedQuery(
    api.pois.get.list,
    { categoryId: selectedCategory },
    { initialNumItems: perPage },
  )

  const [search, setSearch] = useState('')
  const [exclude, setExclude] = useState<boolean>(false)

  const filtered = useMemo(() => {
    if (!search) return results
    return results?.filter((poi) =>
      exclude
        ? !poi.name.toLowerCase().includes(search.toLowerCase())
        : poi.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search, results, exclude])

  if (!results)
    return (
      <div className="max-w-[200px]">
        <Spinner />
      </div>
    )

  return (
    <div className={cn('flex max-w-[200px] flex-col gap-2 overflow-hidden', className)}>
      <h2 className="font-semibold text-sm">
        All Places {results?.length} ({search && filtered.length})
      </h2>
      <div className="inline-flex items-center gap-2">
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Checkbox checked={exclude} onCheckedChange={(e) => setExclude(!!e)} />
      </div>
      <CategorySelect
        categories={categories ?? []}
        disabled={!categories?.length}
        onValueChange={setCategory}
        value={selectedCategory}
      />
      <ul className="h-full overflow-y-auto text-xs">
        {!filtered?.length && !isLoading && <li>No POIs found</li>}
        {isLoading && <li>Loading...</li>}
        {filtered?.map((poi) => (
          <li key={poi._id} className="inline-flex w-full items-center gap-1">
            {poi.category.icon && (
              <CategoryIcon icon={poi.category.icon} style={{ color: poi.category.color.value }} />
            )}
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{poi.name}</span>
          </li>
        ))}
      </ul>
      <Button disabled={isLoading || status === 'Exhausted'} onClick={() => loadMore(perPage)}>
        {isLoading && <Spinner />}
        Load more
      </Button>
    </div>
  )
}
