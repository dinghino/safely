# Device presence

Every device that a user own can have a presence heartbeat that optionally sends
the device last known location to the server, so that the user can know where it
was regardless of active tracking sessions or other conditions.

While the position itself is somewhat pointless for static devices (desktop pc,
laptops etc), this is a requirements for the application for:

- mobile devices, so that we can dispatch notifications based on user position
- trackers and other IoT devices, to handle geofences and lost devices

## Settings

Either from the system, based on device type, or explicit settings from the user,
a device can have its location presence enabled or not. the default is going to
be enabled, while still requiring the user to provide permissions due to how
things work.

## Device vs user presence

There is a major difference between a device and user presence heartbeat:

### Device

A device will provide a heartbeat whenever it is available, online, and capable
of responding to inputs and provide information.

This is to allow a user to see their own devices, if they have issues, where
they are and issue them commands and get notified based on their status.

It is part of the core functionality of the application, that heavily relies on
knowing devices locations to provide a service to the user.

### Users

As it stands now, with `users` we do not care where they are, what device are they
using or other factors.
We currently in fact do not even have a user presence system on the front end,
and we'll be adding this in the future when we add relationships between users,
chat and messaging system and other similar features.

## Dispatching location data

Our device heartbeat allows to provide the last known location of a device.
This location is used mainly to show at a glance where the devices are and to
allow users to see where they last were in case of issues and disconnections.

While the location data is (currently) optional, unless it is not available or
user denied permissions it should **always** be sent to the server for everything
to work properly.

In case of _active_ devices (i.e. user's phone, desktop etc) the last known location
will be later used to send notifications to the users based on what's happening
around them, so again, **while it is technically optional** for now
**if available,it should be sent**.

### Difference with active tracking

Geolocation on heartbeat does not need to be accurate or frequent. we can use
any method that gets the current location on demand and just send that, maybe
using some timeout functionality if available on the device API.
