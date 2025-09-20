# Data Filter nuqs integration

Exposes a single hook to read and write filters to URL search params.

It allows to keep the state of the filters in the URL, allowing for consistent,
shareable filter states.

## Usage

```tsx

import { useDataTableFilters, useFilterSearchParams } from '@/module/data-filters'

function MyComponent() {
  const [filters, setFilters] = useFilterSearchParams({ key: 'mycomponent.filters' })

  const filter = useDataTableFilters({
    filters,
    onFiltersChange: setFilters,
    // ...rest of configuration
  })
}
```

The hook will take care of parsing in and out of the query search params.

### Options

| option | default   | description                                      |
| ------ | --------- | ------------------------------------------------ |
| key    | `filters` | Allows for multiple states to be kept in the URL |
