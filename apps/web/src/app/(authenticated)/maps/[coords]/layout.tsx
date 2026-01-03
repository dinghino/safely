import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/search-input'
import { SectionBreadcrumbs } from './explore/components/breadcrumbs'

type Props = {
  children: React.ReactNode
}

export default async function MapCoordsLayout({ children }: Props) {

  return (
    <aside
      className={cn(
        'h-full w-full',
        'bg-background p-4',
        // 'space-y-4',
        'w-[500px]', // this should be removed when we add resizable sidebar
        'flex flex-col gap-4',
        // 'grid grid-rows-[auto_1fr]',
        'border-border border-r',
      )}
    >
      <header className="h-fit space-y-2">
        <SectionBreadcrumbs />
        <SearchInput placeholder="omnisearch" disabled />
      </header>
      <main className="flex-1 bg-red-500/50">
        {/* {children} */}
      </main>
    </aside>
  )
}
