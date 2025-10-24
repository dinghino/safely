import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS generation - this package just re-exports
  clean: true,
  treeshake: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})
