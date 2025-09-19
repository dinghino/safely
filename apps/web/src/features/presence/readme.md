# Presence feature

This feature exposes functionalities to track user and device presence throught
the app.

## Note

Presence is currently disabled because it relies on `crypto` which does not work
on non https connections, breaking the app on localhost. It will be re-enabled
once we move to https everywhere.
