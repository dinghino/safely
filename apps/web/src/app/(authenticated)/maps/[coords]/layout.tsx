import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/search-input'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Button } from '@workspace/ui/components/button'
import { FilterIcon } from 'lucide-react'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { tv } from 'tailwind-variants'
import { PlacesNameSearchFilter } from '@/features/place-filters/components/places-search'

type Props = {
  children: React.ReactNode
  breadcrumbs: React.ReactNode
}

const variants = tv({
  slots: {
    container: [
      'h-full w-full p-1',
      'flex flex-col gap-0.5',
      // 'w-[500px]', // this should be removed when we add resizable sidebar
    ],
    header: ['h-fit space-y-4', 'p-4'],
    main: ['flex-1 overflow-hidden'],
    scrollable: ['h-full'],
  },
  variants: {
    separated: {
      true: {
        header: ['rounded-md bg-background'],
        main: ['rounded-md bg-background'],
        scrollable: ['p-4'],
      },
      false: {
        container: ['bg-background', 'border-border border-r'],
        header: '',
        main: ['px-4 pb-4'],
        scrollable: ['-mr-4 pr-4'],
      },
    },
  },
})

/**
 * This is the root layout for /maps/[coords] page and is meant to act as a
 * general wrapper for all child components.
 */
export default async function MapCoordsLayout({ children, breadcrumbs }: Props) {
  const classes = variants({ separated: false })
  return (
    <aside className={cn(classes.container())}>
      <header className={cn(classes.header())}>
        {breadcrumbs}
        {/* todo: this becomes the toolbar component, maybe as parallel route? */}
        <ButtonGroup className="w-full">
          <PlacesNameSearchFilter input={{ placeholder: 'Search places, categories, people...' }} />
          <Button size="icon" variant="outline">
            <FilterIcon />
          </Button>
        </ButtonGroup>
      </header>

      <main className={cn(classes.main())}>
        <ScrollArea className={cn(classes.scrollable())}>{children}</ScrollArea>
      </main>
    </aside>
  )
}
