import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  clean: true,
  shims: true,
})
