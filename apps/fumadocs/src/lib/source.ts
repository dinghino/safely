import { loader } from 'fumadocs-core/source'
import { docs } from '@/.source'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { createElement } from 'react'

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon: (icon) => {
    if (!icon) return null
    return createElement(DynamicIcon, { name: icon as IconName, key: crypto.randomUUID() })
  },
})
