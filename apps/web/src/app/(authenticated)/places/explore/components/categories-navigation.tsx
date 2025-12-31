import Link from 'next/link'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import type { CategoryItem as Category, CategoryGroup } from '@/entities/places/types'

import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible'

import { ColoredCategoryIcon } from '@/entities/places/components/category-icon'

import { getCategoryColor } from '@/entities/places/lib'

export function CategoriesNavigation({ data }: { data: Map<CategoryGroup, Category[]> }) {

  return (
    <>
      {Array.from(data.entries()).map(([group, categories]) => (
        <Collapsible key={group._id} defaultOpen>
          <ButtonGroup key={group._id} orientation="vertical" className='w-full'>
            {/* <div key={group._id} className="space-y-2"> */}
            <ButtonGroup className="flex w-full">
              <CollapsibleTrigger asChild>
                <Button variant="secondary" className="group cursor-pointer px-3">
                  <ChevronDownIcon className="group-data-[state=closed]:-rotate-90 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>
              <Button asChild variant="secondary" className="group flex-1 justify-between">
                <Link href={`/places/explore/${group.slug}`}>
                  <h2 className="font-bold text-lg">{group.name}</h2>
                  <ChevronRightIcon className="transition-transform duration-200 group-hover:translate-x-1.5" />
                </Link>
              </Button>
            </ButtonGroup>
            <CollapsibleContent>
              <ButtonGroup orientation="vertical" className="w-full">
                {categories.map((cat) => (
                  <Button asChild variant="outline" className="flex h-fit flex-col justify-start px-1.5"
                    key={cat._id}
                  >
                    <Link href={`/places/explore/${group.slug}/${cat.slug}`}>
                      <div className="inline-flex w-full items-center gap-2">
                        <div className="rounded-lg p-1.5" style={{ background: `${getCategoryColor(cat)}25` }}>
                          <ColoredCategoryIcon category={cat} className="size-5" />
                        </div>
                        <p className='text-md'>{cat.name}</p>
                      </div>
                      {cat.description && <p className="w-full text-wrap text-muted-foreground text-xs">{cat.description}</p>}
                    </Link>
                  </Button>
                ))}
              </ButtonGroup>
            </CollapsibleContent>
            {/* </div> */}
          </ButtonGroup>
        </Collapsible>
      ))}
    </>
  )
}
