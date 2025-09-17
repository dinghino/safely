'use client'

import { createContext } from '@workspace/react-utils'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import type { DragEndEventHandler } from '@/components/sortable/types'
import { usePaginationSearchParams } from '@/hooks'

type UniqueIdentifier = string | number

export namespace DataTableProvider {
  export type State<T extends object> = {
    data: T[]
    table: Table<T>
    loading?: boolean
  }
  type DraggableTableProps =
    | {
        draggable?: false
        onDragEnd?: never
      }
    | {
        draggable: true
        onDragEnd: DragEndEventHandler
      }

  export type Props<T extends { id: UniqueIdentifier }> = {
    data: T[]
    columns: ColumnDef<T>[]
    /** loading state for server side data management */
    loading?: boolean
    /**
     * optional row count for external ssr pagination,
     * for example with search params
     */
    rowCount?: number | null
    /** table name to identify the table instance, handle query params etc */
    tableName?: string
    filters?: ColumnFiltersState
    children: React.ReactNode

    /** Initial table state */
    initialState?: {
      sorting?: SortingState
      columnFilters?: ColumnFiltersState
      columnVisibility?: VisibilityState
      rowSelection?: Record<string, boolean>
    }
  } & DraggableTableProps
}

type DataTableContextValue<T extends object = object> = DataTableProvider.State<T>

const [ContextProvider, useContext] = createContext<DataTableContextValue>('DataTableContext')

export function useDataTable<T extends object>() {
  return useContext() as unknown as DataTableContextValue<T>
}

/**
 * DataTableProvider is the main element to build our data-table framework UI.
 * It manages the react-table instance and options and handles (most) of the
 * business logic for the table. it exposes the table instance and data to the
 * children components via the context.
 * @see {@link useDataTable} to access the table instance and data
 * @see {@link DataTable} for the main visualization component
 */
export function DataTableProvider<T extends { id: UniqueIdentifier }>(
  props: DataTableProvider.Props<T>,
) {
  const {
    data: initialData,
    rowCount,
    columns: userColumns,
    filters,
    children,
    // initialState: init = {},
    loading,
  } = props

  // testing for react dnd allowing to move rows. might not be needed
  const [data, setData] = useState<T[]>(() => initialData)
  useEffect(() => setData(initialData), [initialData])

  // If draggable, inject drag handle column at the start
  const columns = useMemo(() => userColumns, [userColumns])

  const [sorting, setSorting] = useState<SortingState>([])
  // used only if we are not using external filters, but needed otherwise
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [pagination, setPagination] = usePaginationSearchParams({ base: props.tableName })

  const table = useReactTable<T>({
    data,
    columns,
    initialState: {},
    state: {
      sorting,
      columnFilters: filters ?? columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    // these are to handle server side pagination with our queries.
    manualPagination: typeof rowCount === 'number',
    rowCount: rowCount ?? data.length,
    autoResetPageIndex: false,
    // extras
    _features: [],
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    // allows for server filtering or local if we don't pass any filters
    onColumnFiltersChange: filters ? undefined : setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const value = {
    data,
    table,
    loading,
  } satisfies DataTableContextValue<T>

  return (
    <ContextProvider value={value as unknown as DataTableContextValue}>{children}</ContextProvider>
  )
}
