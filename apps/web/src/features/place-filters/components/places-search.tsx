'use client'

import { Search } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import { usePlaceFilters } from '../context/place-filters-provider'

/**
 * Search filter for places by name.
 */
export function PlacesNameSearchFilter() {
  const { searchQuery, setSearchQuery } = usePlaceFilters()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value || null)
  }

  return (
    <InputGroup>
      <InputGroupInput
        id="search-filter"
        placeholder="Search places..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full"
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {/* we can show the results count here if we hook up to the list also */}
      <InputGroupAddon align="inline-end">{/*12 results*/}</InputGroupAddon>
    </InputGroup>
  )
}
