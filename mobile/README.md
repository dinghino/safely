# Safely.PET Native app

This is the mobile app for safely.pet, built with expo and react-native-background-geolocation,
clerk, convex and react reusables (shadcn for native) on top nativewind with tailwind v3.

## Note

This app **should** be inside the `/apps` folder like the rest of the apps, BUT
we are having issues with the geolocation plugin events if we run this along
the rest of the apps with the monorepo handling dependencies, probably due some
deduplicated modules that don't match up and we are unable to respond to events.

For now the app lives inside the repository BUT as a standalone project that needs
to be managed separately
