import type { ConfigPlugin } from 'expo/config-plugins'
import { withFinalizedMod } from '@expo/config-plugins'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Expo Config Plugin to automatically patch Android gradle files with ninja path workaround
 * for Windows path length limitations.
 *
 * This plugin modifies:
 * - android/build.gradle: Adds global CMAKE settings for all native modules
 * - android/app/build.gradle: Adds CMAKE settings for the app module
 *
 * @note This plugin is a workaround for Windows path length limitations and is been
 *       built by copilot from the actual changes we made.
 * @see https://docs.expo.dev/config-plugins/dangerous-mods/
 * @see https://github.com/expo/expo/issues/36274
 */
const withNinjaPathFix: ConfigPlugin = (config) => {
  // return withAndroidManifest(config, config => {
  // Patch root build.gradle
  const rootPatch = withFinalizedMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(config.modRequest.platformProjectRoot, 'build.gradle')

      let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf-8')

      // Check if already patched
      if (buildGradleContent.includes('CMAKE_OBJECT_PATH_MAX')) {
        console.log('✓ android/build.gradle already patched with ninja fix')
        return config
      }

      // Find the allprojects block and add the afterEvaluate patch
      const allProjectsBlockRegex = /(allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?\})\s*\}/

      const ninjaPathPatch = `

// Apply CMAKE_OBJECT_PATH_MAX globally to all subprojects with externalNativeBuild
afterEvaluate { project ->
  if (project.hasProperty('android')) {
    project.android {
      if (it.hasProperty('defaultConfig')) {
        def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()
        def ninjaPath = "\${projectRoot}/tools/ninja.exe".replace('\\\\', '/')
        defaultConfig {
          externalNativeBuild {
            cmake {
              arguments "-DCMAKE_MAKE_PROGRAM=\${ninjaPath}", "-DCMAKE_OBJECT_PATH_MAX=1024"
            }
          }
        }
      }
    }
  }
}
}`

      buildGradleContent = buildGradleContent.replace(allProjectsBlockRegex, `$1${ninjaPathPatch}`)

      fs.writeFileSync(buildGradlePath, buildGradleContent)
      console.log('✓ Patched android/build.gradle with ninja path fix')

      return config
    },
  ]) // end of withFinalizedMod for root build.gradle
  // }) // end of withAndroidManifest

  const appPatch = withFinalizedMod(rootPatch, [
    'android',
    async (config) => {
      const appBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'build.gradle',
      )

      let appBuildGradleContent = fs.readFileSync(appBuildGradlePath, 'utf-8')

      // Check if already patched
      if (appBuildGradleContent.includes('Workaround for Windows path length limitation')) {
        console.log('✓ android/app/build.gradle already patched with ninja fix')
        return config
      }

      // Find the defaultConfig block and add the externalNativeBuild section
      const defaultConfigRegex = /(defaultConfig\s*\{[\s\S]*?buildConfigField[^\n]*\n)/

      const appNinjaPathPatch = `
        // Workaround for Windows path length limitation
        externalNativeBuild {
            cmake {
                def ninjaPath = "\${projectRoot}/tools/ninja.exe".replace('\\\\', '/')
                arguments "-DCMAKE_MAKE_PROGRAM=\${ninjaPath}", "-DCMAKE_OBJECT_PATH_MAX=1024"
            }
        }
`

      appBuildGradleContent = appBuildGradleContent.replace(
        defaultConfigRegex,
        `$1${appNinjaPathPatch}`,
      )

      fs.writeFileSync(appBuildGradlePath, appBuildGradleContent)
      console.log('✓ Patched android/app/build.gradle with ninja path fix')

      return config
    },
  ])
  return appPatch
}

export default withNinjaPathFix
