import { SearchInput } from '@/components/search-input'

export default function MapCoordsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-background p-2">
      <SearchInput placeholder="omnisearch" disabled />
      {children}
    </div>
  )
}
