import 'tsx/cjs'
import type { ExpoConfig } from 'expo/config'
import { withPlugins } from 'expo/config-plugins'

const makeConfig = ({ config }: { config: ExpoConfig }) => {
  return {
    expo: {
      ...config,
      name: 'Safely.PET',
      slug: 'safely-pet',
      scheme: 'safely',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      newArchEnabled: true,
      jsEngine: 'hermes',
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      ios: {
        supportsTablet: true,
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff',
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: 'com.anonymous.safelypet',
      },
      web: {
        favicon: './assets/favicon.png',
      },
      // plugins: [
      //   ['expo-secure-store', {}],
      //   'react-native-background-geolocation',
      //   'react-native-background-fetch',
      //   [
      //     'expo-gradle-ext-vars',
      //     { googlePlayServicesLocationVersion: '21.1.0', appCompatVersion: '1.4.2' },
      //   ],
      //   './plugins/ninja-fix.ts', // MUST be absolute last
      // ],
      experiments: {
        reactCanary: true,
      },
    } satisfies ExpoConfig,
  }
}

module.exports = ({ config }: { config: ExpoConfig }) => {
  const step = makeConfig({ config })
  return {
    expo: withPlugins(step.expo, [
      './plugins/ninja-fix.ts',
      ['expo-secure-store', {}],
      'react-native-background-geolocation',
      [
        'expo-gradle-ext-vars',
        { googlePlayServicesLocationVersion: '21.1.0', appCompatVersion: '1.4.2' },
      ],
      'react-native-background-fetch',
      ['react-native-maps', {}]
    ]),
  }
}
