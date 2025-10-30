/**
 * @fileoverview This file is used to register all the bottom sheets
 * used in the app with react-native-actions-sheet.
 * @see https://rnas.vercel.app/guides/sheetmanager
 */
import { registerSheet, type RouteDefinition, type SheetDefinition } from 'react-native-actions-sheet'

import { DeviceSettingsSheet } from './device-settings'
import { DebugLocationsDataSheet } from './debug-locations-data'
import { DebugGeoEventsSheet } from './debug-geo-events'

registerSheet('device-settings', DeviceSettingsSheet)
registerSheet('debug-locations-data', DebugLocationsDataSheet)
registerSheet('debug-geo-events', DebugGeoEventsSheet)

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    'device-settings': SheetDefinition<{
      payload: DeviceSettingsSheet.Props
    }>
    'debug-locations-data': SheetDefinition<{
      payload: DebugLocationsDataSheet.Props
    }>
    'debug-geo-events': SheetDefinition<{
      payload: DebugGeoEventsSheet.Props,
      routes: {
        'events-list': RouteDefinition
        'events-filter': RouteDefinition
      }
    }>
  }
}

// export {}
