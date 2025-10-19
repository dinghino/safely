const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('node:path')

// Find the project and workspace root directories
const projectRoot = __dirname
// const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [
  projectRoot,
  // workspaceRoot
]

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  // path.resolve(workspaceRoot, 'node_modules'),
]

// 3. Force Metro to resolve all extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs']

// 4. Pin critical modules to a single physical location to avoid duplicate instances
// const rootNodeModules = path.resolve(workspaceRoot, 'node_modules')
// config.resolver.disableHierarchicalLookup = true
// config.resolver.extraNodeModules = {
//   // Core singletons
//   react: path.join(rootNodeModules, 'react'),
//   'react-native': path.join(rootNodeModules, 'react-native'),
//   // Native module and its companion
//   'react-native-background-geolocation': path.join(
//     rootNodeModules,
//     'react-native-background-geolocation',
//   ),
//   'react-native-background-fetch': path.join(
//     rootNodeModules,
//     'react-native-background-fetch',
//   ),
// }

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 })
