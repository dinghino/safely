# Safely.PET Native app

This is the mobile app for safely.pet, built with expo and react-native-background-geolocation,
clerk, convex and react reusables (shadcn for native) on top nativewind with tailwind v3.

## Why not in /apps

This app **should** be inside the `/apps` folder like the rest of the apps, BUT
we are having issues with the geolocation plugin events if we run this along
the rest of the apps with the monorepo handling dependencies, probably due some
deduplicated modules that don't match up and we are unable to respond to events.

For now the app lives inside the repository BUT as a standalone project that needs
to be managed separately

### Issues resolution

Since we are not technically in the monorepo workspace, we may encounter issues
where we need to use internal packages but they look like they are not available.

To solve this we need to `bun link` the package we want, add it as a dependency linked,
and update the `metro.config.js` to be able to resolve our imports during build.

```bash
# go to the package
cd packages/<name>
bun link

cd ../mobile
# add dependency
```

in `/mobile/metro.config.js` we need to add the aliases for the imports and,
optionally, the watch for changes so we are able to do HMR

## Running the app

The app needs `prebuild` due to native dependencies and run on device through expo

To run on device you need to have your device visible from `adb` connecting either
through USB or wifi

```bash
adb connect <device-ip>:5555
```

```bash
npx expo prebuild
npx expo run:android
```

or from package.json

```bash
bun prebuild
bun android
```

## Useful links

- [react-native-action-sheets](https://rnas.vercel.app/) to bottom sheets globally
