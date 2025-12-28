'use client'

import { CategoryIconStatic } from '@/entities/places/categories'
import { usePlacePopup } from './place-popup-context'

export namespace PlacePopupHeader {
  export type Props = Record<string, never>
}

export const PlacePopupHeader = () => {
  const { name, category } = usePlacePopup()

  return (
    <header className="flex items-center gap-3 border-b pb-3">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category.color.value}15` }}
      >
        <CategoryIconStatic
          icon={category.icon}
          style={{ color: category.color.value }}
          className="size-6"
        />
      </div>
      <div className="flex flex-col overflow-hidden">
        <h3 className="line-clamp-2 font-bold text-sm leading-snug" title={name}>
          {name}
        </h3>
        <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
          {category.name}
        </span>
      </div>
    </header>
  )
}
