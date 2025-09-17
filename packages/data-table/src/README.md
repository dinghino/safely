# Generic Data Table Framework

A reusable, flexible data table framework built on top of `@tanstack/react-table` and shadcn/ui components. Designed for rapid creation of consistent data tables across different entities while maintaining modularity and type safety.

## Quick Start

```tsx
import { ColumnDef } from '@tanstack/react-table'
import {
  DataTableProvider,
  DataTableToolbar,
  DataTable,
  DataTablePagination,
} from '@/modules/data-table'

// 1. Define your data type
interface MyData {
  id: string
  name: string
  email: string
}

// 2. Define columns
const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

// 3. Create your data table component
export function MyDataTable({ data }: { data: MyData[] }) {
  return (
    <DataTableProvider data={data} columns={columns}>
      <div className="flex flex-col gap-4">
        <DataTableToolbar />
        <DataTable />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  )
}
```

## Architecture Overview

### Core Components

#### `DataTableProvider`

The heart of the framework. Manages all table state and provides it through React Context.

```tsx
<DataTableProvider<MyDataType>
  data={data} // Your data array
  columns={columns} // Column definitions
  initialState={{
    // Optional initial state
    sorting: [],
    columnVisibility: {},
    rowSelection: {},
  }}
>
  {children}
</DataTableProvider>
```

#### `DataTable`

The actual table renderer. Completely generic and talks to the context.

```tsx
<DataTable
  className="custom-table-wrapper" // Optional styling
  emptyStateMessage="No data found" // Custom empty message
  showSelection={true} // Show row selection state
/>
```

#### `DataTableToolbar`

Flexible toolbar with actions and column visibility toggle.

```tsx
<DataTableToolbar
  actions={<Button>Add Item</Button>} // Right-side actions
  columnToggle={{
    // Column toggle config
    label: 'Columns',
    hideLabel: false,
  }}
>
  {/* Left-side content like search */}
  <Input placeholder="Search..." />
</DataTableToolbar>
```

#### `DataTablePagination`

Full-featured pagination with page size controls.

```tsx
<DataTablePagination
  showPageSize={true} // Show page size selector
  pageSizeOptions={[10, 20, 50]} // Available page sizes
  labels={{
    // Custom labels
    rowsPerPage: 'Items per page',
    pageOf: 'Page',
    rowsSelected: 'selected',
  }}
/>
```

## Real-World Example

Here's how the `UserDataTable` uses this framework:

```tsx
export function UserDataTable({
  data,
  onUserDelete,
  onRoleChange,
  onVerificationChange,
  className,
}: UserDataTableProps) {
  // Entity-specific column configuration
  const columns = useMemo(
    () =>
      getColumns({
        onUserDelete,
        onRoleChange,
        onVerificationChange,
      }),
    [onUserDelete, onRoleChange, onVerificationChange],
  )

  // Entity-specific actions
  const addUserAction = (
    <Button variant="outline" size="sm" disabled>
      <UserPlus className="size-4" />
      <span className="@max-xl:hidden">Add User</span>
    </Button>
  )

  return (
    <DataTableProvider data={data} columns={columns}>
      <div className={cn('flex flex-col gap-4', className)}>
        <DataTableToolbar actions={addUserAction} />
        <DataTable emptyStateMessage="No users found." />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  )
}
```

## Advanced Usage

### Enhanced Sorting with Toolbar Controls

In addition to sortable column headers, you can add dedicated sort controls to the toolbar:

```tsx
import { DataTableSortControls } from '@/modules/data-table'

const sortOptions = [
  { label: 'Name', value: 'fullName', column: 'fullName' as keyof MyData },
  { label: 'Email', value: 'email', column: 'email' as keyof MyData },
  { label: 'Role', value: 'role', column: 'role' as keyof MyData },
]

function MyTableToolbar() {
  return (
    <DataTableToolbar actions={<AddButton />}>
      <div className="flex items-center space-x-2">
        <DataTableSearchFilter
          column={table.getColumn('name')}
          placeholder="Search..."
          showIcon
          showClear
        />
        <DataTableSortControls options={sortOptions} />
      </div>
    </DataTableToolbar>
  )
}
```

### Enhanced Filtering with Active Filter Display

Show active filters and allow users to clear them individually:

```tsx
import {
  DataTableSearchFilter,
  DataTableSelectFilter,
  DataTableActiveFilters,
} from '@/modules/data-table'

function MyTableFilters() {
  const filterLabels = {
    name: 'Name',
    role: 'Role',
    status: 'Status',
  }

  const formatters = {
    role: (value: unknown) => {
      const role = roleOptions.find((r) => r.value === value)
      return role?.label || String(value)
    },
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center space-x-2">
        <DataTableSearchFilter
          column={table.getColumn('name')}
          placeholder="Search users..."
          showIcon
          showClear
          debounce={300}
        />
        <DataTableSelectFilter
          column={table.getColumn('role')}
          title="Role"
          options={roleOptions}
          showClear
        />
      </div>

      <DataTableActiveFilters filterLabels={filterLabels} formatters={formatters} />
    </div>
  )
}
```

### Initial State Configuration

Configure default sorting, filters, and pagination:

```tsx
<DataTableProvider
  data={data}
  columns={columns}
  initialState={{
    sorting: [{ id: 'name', desc: false }],
    columnFilters: [{ id: 'status', value: 'active' }],
    pageSize: 20,
    columnVisibility: { internalId: false },
  }}
>
  {/* Your table components */}
</DataTableProvider>
```

### Custom Column Definitions

```tsx
const columns: ColumnDef<MyData>[] = [
  // Simple accessor
  {
    accessorKey: 'name',
    header: 'Name',
  },

  // Custom cell renderer
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },

  // Actions column
  {
    id: 'actions',
    cell: ({ row }) => <ActionsDropdown item={row.original} />,
  },
]
```

### Using Entity-Specific UI Components

```tsx
// In entities/user/ui/
export function UserInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} />
      <div>
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  )
}

// In your columns
{
  accessorKey: 'fullName',
  header: 'User',
  cell: ({ row }) => <UserInfo user={row.original} />
}
```

### Context Hook

Access the table instance anywhere within the provider:

```tsx
import { useDataTable } from '@/modules/data-table'

function CustomTableComponent() {
  const { table } = useDataTable<MyDataType>()

  // Access any table method
  const selectedRows = table.getSelectedRowModel().rows
  const isFiltered = table.getState().columnFilters.length > 0

  return <div>{/* Your component */}</div>
}
```

## Migration from Old Pattern

### Before (Manual Table Management)

```tsx
export function OldDataTable({ data }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>{/* Search/filters */}</div>
        <div>{/* Actions + column toggle */}</div>
      </div>
      <div className="rounded-md border">
        <Table>{/* 40+ lines of table rendering */}</Table>
      </div>
      <div>{/* 20+ lines of pagination */}</div>
    </div>
  )
}
```

### After (Framework Pattern)

```tsx
export function NewDataTable({ data }) {
  return (
    <DataTableProvider data={data} columns={columns}>
      <div className="flex flex-col gap-4">
        <DataTableToolbar actions={actions} />
        <DataTable />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  )
}
```

## Benefits

### 🚀 **Rapid Development**

- New entity data tables in minutes, not hours
- Consistent UX patterns across all tables
- No table state management boilerplate

### 🔧 **Flexibility**

- Compose only the components you need
- Customize behavior through props
- Entity-specific logic stays in entity boundaries

### 🎯 **Type Safety**

- Full TypeScript support with generics
- IntelliSense for table methods and data
- Compile-time column validation

### 🏗️ **Architecture**

- FSD-compliant structure
- Clear separation of concerns
- Reusable across any data type

## Creating New Entity Data Tables

1. **Define your entity's data table row type**
2. **Create column definitions with entity-specific UI components**
3. **Compose the framework components**
4. **Add entity-specific actions and callbacks**

```tsx
// entities/order/ui/order-data-table.tsx
export function OrderDataTable({ data, onStatusChange }: OrderDataTableProps) {
  const columns = useMemo(() => getOrderColumns({ onStatusChange }), [onStatusChange])

  return (
    <DataTableProvider data={data} columns={columns}>
      <div className="flex flex-col gap-4">
        <DataTableToolbar actions={<CreateOrderButton />} />
        <DataTable emptyStateMessage="No orders found." />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  )
}
```

That's it! You now have a fully-featured, consistent data table with sorting, filtering, pagination, and column visibility - all in ~15 lines of code.
