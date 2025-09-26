# Geolocation framework

This package contains core business logic and functionalities to handle geolocation activities for the application.

It exposes interfaces and state machines to be used in the various applications
to handle most things related to the user's devices geolocation.

## Geolocation

The actual geolocation data retrieval is handled through the geolocation state machine, which expects a service object that implements the `Locator.Provider`
interface.

This is to allow different applications to create custom adapters around what
the devices they will be running on offer for using geolocation APIs.

> The interface is prone to minor changes in the future due to rapid development
> of the system.

## Session manager

The session manager handles active tracking session and expects a geolocation
state machine to handle retrieving the position to dispatch to the server.

It also needs to be provided a way to actually send to the server the information.

> note:
> This is still in development; system can be custom actors, a function in
> context or just with the state machine emitting events and leaving to the
> consumer the task of listening to the event and executing the api call.

## Hearbeat ?

Still deciding if the heartbeat functionality, which will rely on geolocation,
will live in this package, its own package or directly in the apps.
