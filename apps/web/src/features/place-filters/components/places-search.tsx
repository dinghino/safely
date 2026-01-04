'use client'

import { Search, XIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import { usePlaceFilters } from '../context/place-filters-provider'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@/lib/utils'

export namespace PlacesNameSearchFilter {
  export type Props = React.ComponentProps<typeof InputGroupInput> & {
    input?: React.ComponentProps<typeof InputGroupInput>
  }
}

/**
 * Search filter for places by name.
 */
export function PlacesNameSearchFilter({ input, ...props }: PlacesNameSearchFilter.Props) {
  const { searchQuery, setSearchQuery } = usePlaceFilters()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value || null)
  }

  return (
    <InputGroup {...props}>
      <InputGroupInput
        id="search-filter"
        placeholder="Search places..."
        {...input}
        className={cn('w-full', input?.className)}
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {/* we can show the results count here if we hook up to the list also */}
      <InputGroupAddon align="inline-end">
        {searchQuery && (
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="size-6">
            <XIcon />
          </Button>
        )}
      </InputGroupAddon>
    </InputGroup>
  )
}
