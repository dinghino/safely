import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
import { remarkMdxFiles } from 'fumadocs-core/mdx-plugins'
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins'
// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const user = defineDocs({
  dir: 'content/user',
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export const developer = defineDocs({
  dir: 'content/developer',
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: [
      remarkMdxFiles,
      remarkMdxMermaid,
    ],
  },
  lastModifiedTime: 'git',
})
