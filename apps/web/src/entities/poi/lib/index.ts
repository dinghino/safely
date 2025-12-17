export type Color = {
  value: string
  format: string // 'hex' | 'rgb' | 'hsl' -- we'll narrow later
}
export type Colorful = {
  color: Color
}
// | { group: { color: Color } }
export function getCategoryColor<T extends Colorful>(item: T) {
  if (hasColor(item)) {
    return item.color.value
  }
  // return item.group.color.value
  // try {
  //   const color = 'color' in item ? item.color.value : item.group.color.value
  //   return color
  // } catch {
  return '#E5E7EB'
  // }
}

function hasColor<T extends Colorful>(item: T): item is Extract<T, { color: Color }> {
  return 'color' in item && item.color !== undefined
}
