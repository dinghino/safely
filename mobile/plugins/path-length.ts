import { type ConfigPlugin, withGradleProperties } from 'expo/config-plugins'

interface PathLengthProps {
  /** Custom path to ninja executable (optional) */
  ninjaPath?: string
  /** Maximum object path length (default: 1024) */
  maxPathLength?: number
}

/**
 * Expo Config Plugin to automatically configure CMAKE settings via gradle.properties
 * for Windows path length limitations.
 *
 * This plugin uses a completely programmatic approach with ZERO string injection:
 * - gradle.properties: Sets CMAKE environment variables that gradle reads automatically
 * - No file generation, no string manipulation, no gradle script injection
 * - Uses gradle's built-in property resolution system
 *
 * @note This plugin is a workaround for Windows path length limitations.
 * @see https://docs.expo.dev/config-plugins/dangerous-mods/
 * @see https://github.com/expo/expo/issues/36274
 */
const withPathLengthFix: ConfigPlugin<PathLengthProps> = (config, props = {}) => {
  const { ninjaPath = '../tools/ninja.exe', maxPathLength = 1024 } = props

  // Use gradle.properties to set CMAKE options that gradle will pick up automatically
  // This is the cleanest approach - no string injection anywhere!
  return withGradleProperties(config, (config) => {
    // CMAKE_MAKE_PROGRAM can be set via gradle properties and picked up by the Android Gradle Plugin
    config.modResults.push({
      type: 'property',
      key: 'android.cmake.arguments',
      value: `-DCMAKE_MAKE_PROGRAM=\${projectDir}/${ninjaPath.replace(/\\/g, '/')}, -DCMAKE_OBJECT_PATH_MAX=${maxPathLength}`,
    })

    // Also set individual properties for reference
    config.modResults.push({
      type: 'property',
      key: 'cmake.ninja.path',
      value: ninjaPath,
    })

    config.modResults.push({
      type: 'property',
      key: 'cmake.object.path.max',
      value: maxPathLength.toString(),
    })

    console.log('✓ Path length fix configured via gradle.properties (no string injection)')

    return config
  })
}

export default withPathLengthFix
