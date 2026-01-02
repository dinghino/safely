import { SearchInput } from '@/components/search-input'
import { cn } from '@/lib/utils'

export default function MapCoordsLayout({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className={cn(
        'h-fit w-full',
        'bg-background p-4',
        'space-y-4',
        'w-[500px]',
        // 'min-w-[256px] max-w-[600px]',
        'overflow-y-auto',
      )}
    >
      <SearchInput placeholder="omnisearch" disabled />
      {children}
      {/* filler for overflow testing */}
      <div className="h-[5000px]" />
    </aside>
  )
}
