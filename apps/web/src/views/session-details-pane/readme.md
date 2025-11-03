# Session details

This view is meant to aggregate a series of information about a device tracking
session and display them to the user in an organized manner.

The component is to be used as is, providing a `tracking session id`, and its
internals - both local and coming from `features` and `entities` can be used
independently provided the correct data.

## Meant use

The aggregate view component is meant to render either inside a `Resizable` pane
or a `Sheet` or bottom `Drawer` (for mobile views).
