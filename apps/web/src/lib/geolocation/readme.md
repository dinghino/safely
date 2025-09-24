# Geolocation API

This module should expose a simple functional API to handle geolocation on the
browser and PWA implementation of the app.

This solution is not production ready for the app needs due to hardware and
privacy restrictions on devices, that prevent the system to consistently access
geolocation data from the device in most of the situations, but should be a working
functionality for when the application is currently in use and provide most
of the functionalities to implement the front end business logic through
state machines.

## Contents

The package loosely contains

- an xstate state machine to handle geolocation over time,
  caching and forwarding requests to the provided API.
- a `Locator` namespace with a `Provider` interface that represents the contract
  for any geolocation provider implementation.

## Usage

- Implement a `Locator.Provider` interface to provide geolocation data
  from the browser or any other source.
- spawn the machine in whatever way your framework supports xstate, passing your
  provider implementation as a context property.
- use the machine events to request geolocation data and listen to state changes

### Usage as a subsystem

The geolocator machine can be used as a subsystem of a larger state machine
that handles the overall application state, either spawned internally or
provided as an actor to the parent machine, which is how it is designed to
be used.
