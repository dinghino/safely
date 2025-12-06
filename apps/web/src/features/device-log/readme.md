# Device log feature

This feature exposes functionalities and components to show device event timelines
in the web application.

## Components

The primary interface is the `DeviceEvents` component, displaying the timeline
of the events from the server.

The feature also includes supporting components such as:

- `EventItem`: Represents a single event in the timeline.
- `EventFilter`: Allows filtering events based on criteria like date range and event type.
- `EventDetails`: Displays detailed information about a selected event.

## API

The feature interacts with the backend API to fetch device logs and events.

> The API documentation can be found in the backend repo and in the documentation site,
> when it will be created.

For developoment purposes we are currently mocking data and have all the shared types
and interfaces defined in the web app until we create the dedicated backend code.
