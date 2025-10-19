import 'tsx/cjs'
import type { ExpoConfig } from 'expo/config'
import { withPlugins } from 'expo/config-plugins'

const baseConfig = ({ config }: { config: ExpoConfig }): { expo: ExpoConfig } => ({
  expo: {
    ...config,
    name: 'safely.pet',
    slug: 'safely.pet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'safelypet',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.anonymous.safely.pet',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
})

export default function ({ config }: { config: ExpoConfig }) {
  const base = baseConfig({ config })
  return {
    expo: withPlugins(base.expo, [
      // './plugins/path-length.ts',
      './plugins/ninja-fix.ts',
      'expo-router',
      'expo-secure-store',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      ['react-native-background-geolocation', {
        // api key and such
      }],
      [
        'expo-gradle-ext-vars',
        {
          googlePlayServicesLocationVersion: '21.1.0',
          appCompatVersion: '1.4.2',
        },
      ],
      'react-native-background-fetch',
    ]),
  }
}
