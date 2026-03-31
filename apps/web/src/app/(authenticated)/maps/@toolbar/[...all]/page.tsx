'use client'

import { GroupedCategoryMultiSelect } from '@/entities/places/category-select'
import { usePoiCategories } from '@/features/poi-categories/hooks'
import { Button } from '@workspace/ui/components/button'

export default function MapToolbar() {
  const categories = usePoiCategories()
  return <>
    <Button>Demo button</Button>
    {categories ? <GroupedCategoryMultiSelect categories={categories} /> : null}
  </>
}
