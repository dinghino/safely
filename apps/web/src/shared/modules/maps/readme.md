# Shared map module

This module contains leaflet elements allowing nextjs to use react-leaflet
properly and integrating with our ui design.

## Moving to shared packages

before moving to shared packages we need to split all core logic from UI rendering
and elements loading.

since nextjs does SSR by default for example we are currently lazy loading with `dynamic`
our map main component and a few other elements. This _might_ be different on native,
and for sure won't be using `next/dynamic`.

- [ ] move all the core logic and react <-> leaflet linking to pure logic hooks
- [ ] split and migrate ui components to `widgets` or `/[shared/]components/maps`
