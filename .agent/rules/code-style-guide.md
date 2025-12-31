---
trigger: always_on
---

# Safely Code Style & Architecture Guide

This document defines the coding standards and architectural principles for the Safely project.

## 1. Project Architecture (FSD)

The project follows **Feature-Sliced Design (FSD)**. Hierarchy must be respected:

- **Entities**: Domain-specific UI components and logic (e.g., `PlaceCard`, `DeviceList`). Atomic components specific to the web app live here.
- **Features**: Functional user actions, hooks, contexts, and feature-specific UI (e.g., `poi-categories/hooks`, `place-map/context`).
- **Widgets**: Composition of multiple components from entities/features (e.g., `PlaceMapWidget`).
- **Packages/UI**: Base primitive components (Shadcn) used across all apps.

## 2. Component Development

### Namespaced Prop Types & Destructuring

Always export component props using a namespaced pattern matching the component name.
**Prefer destructuring props inside the component body** rather than in the function signature for better readability.

```typescript
// Example: MyComponent.tsx
export namespace MyComponent {
  export type Props = {
    title: string;
    onAction: () => void;
  }
}

export function MyComponent(props: MyComponent.Props) {
  const { title, onAction } = props
  return <div onClick={onAction}>{title}</div>;
}
```

### Atomic Design & Composition

- **Composition over Props**: Use `children` or specialized contexts to share data instead of passing deep prop chains.
- **Atomicity**: Break down monolithic components into smaller, reusable pieces within their respective FSD layer.
- **Base Components**: Always prefer using components from `packages/ui` as building blocks.

### Barrel Exports & Public API

- **Root index.ts**: Every slice (Feature, Entity, Widget) must have a root `index.ts` acting as a public API.
- **Named vs Default Exports**:
  - Use **Named Exports** for building blocks, hooks, and types to allow granular consumption.
  - Use a **Default Export** for the "primary interface" or "ready-to-use" variant (e.g., a fully composed Widget or a Provider).
- **Example Pattern**: A Map slice might default export a `SafeMap` (with tiles/controls) while named exporting `TileLayer`, `MapControls`, and `useMapContext` for custom compositions.

## 3. Naming & Geospatial Rules

- **File Naming**: Use **kebab-case** for ALL files and directories (e.g., `use-device-sync.ts`, `place-card.tsx`).
- **Geospatial Coordinates**:
  - **Convex/Backend**: Follow GeoJSON standard `[longitude, latitude]`.
  - **Leaflet/Frontend UI**: Expects `[latitude, longitude]`.
  - **Conversion**: Be extremely careful when passing data between the two. Document which format a utility function expects.

## 4. Documentation & Comments

- **WHY over WHAT**: Comments should explain the rationale behind a technical decision, not restate the code.
- **Meaningful Docstrings**: Use JSDoc for functions/hooks. Focus on the *intent* and *constraints*.

## 5. Backend Rules (Convex)

- **Internal vs Public**: Clearly separate internal utility functions from public API queries/mutations.
- **Schema Validation**: Every argument must be strictly validated using `v`.
- **Logic Placement**: Business logic should reside in `lib/` within the backend package, keeping the route handlers lean.
