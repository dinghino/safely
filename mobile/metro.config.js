const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { resolve } = require('node:path')

// Find the project and workspace root directories
const projectRoot = __dirname
// const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all files within the monorepo for changes
config.watchFolders = [
  projectRoot,
  resolve(projectRoot, '../packages/backend'),
  // workspaceRoot
]

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  resolve(projectRoot, 'node_modules'),
  // path.resolve(workspaceRoot, 'node_modules'),
]

// Force Metro to resolve all extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs']

// Add alias for workspace packages until we can add the app to the monorepo setup
config.resolver.alias = {
  '@workspace/backend': resolve(projectRoot, '../packages/backend'),
  '@workspace/backend/api': resolve(projectRoot, '../packages/backend/convex/_generated/api.js'),
  '@workspace/backend/types': resolve(projectRoot, '../packages/backend/types/index.ts'),
  '@workspace/backend/react': resolve(projectRoot, '../packages/backend/react/index.ts'),
}

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 })
