# Geolocation feature

This feature implements our core geolocation functionality for this react app.
it relies on internal and external packages to do so.

## Why isn't everything in here?

If at the time of reading you are seeing relative imports from `@/lib/*` for
geolocation things, is because we still have not moved that logic to a separate
package in the monorepo.

The idea is that we use all that same logic to handle the same stuff on all the applications
along with the other geolocation related features. using xstate state machines
allow us to define all the workflow, events, etc in a single unified place and
compose, through `input` an `context` or `machineLogic.provide({...})` calls the specific
override things and pass down the concrete implementations of what we need on the
devices we are running on.

## What is in here then?

This feature module should be pretty small, containing a react context that
implements geolocation through the browser `navigation.geolocation` API, a few
small helper hooks and not much more.

The bulk of the logic will live in the state machine package and the concrete
implementation of the Facade object for the geolocation API.
