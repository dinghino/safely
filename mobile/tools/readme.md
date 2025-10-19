# Project Tools

This folder contains a set of extra tools and dependencies to have things work
as intended.

## Mobile app

### Ninja fix

On Windows at least we are encountering an issue building the development build
of the mobile app with paths too long due to our turborepo with bun setup.

the solution comes from [this](https://github.com/ninja-build/ninja/issues/1900#issuecomment-1817532728) issue and involves having ninja locally somewhere
and overriding the gradle build stuff in the android (and maybe ios?) folder
manually.

add this to the `mobile/android/build.gradle#allprojects`

```gradle
// Apply CMAKE_OBJECT_PATH_MAX globally to all subprojects with externalNativeBuild
afterEvaluate { project ->
  if (project.hasProperty('android')) {
    project.android {
      if (it.hasProperty('defaultConfig')) {
        def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()
        def ninjaPath = "${projectRoot}/../../tools/ninja.exe".replace('\\', '/')
        defaultConfig {
          externalNativeBuild {
            cmake {
              arguments "-DCMAKE_MAKE_PROGRAM=${ninjaPath}", "-DCMAKE_OBJECT_PATH_MAX=1024"
            }
          }
        }
      }
    }
  }
}
```

and this to the `mobile/android/app/build.gradle#defaultConfig`

```gradle
// Workaround for Windows path length limitation
externalNativeBuild {
    cmake {
        def ninjaPath = "${projectRoot}/../../tools/ninja.exe".replace('\\', '/')
        arguments "-DCMAKE_MAKE_PROGRAM=${ninjaPath}", "-DCMAKE_OBJECT_PATH_MAX=1024"
    }
}
```
