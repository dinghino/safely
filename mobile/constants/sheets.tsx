/**
 * @fileoverview This file is used to register all the bottom sheets
 * used in the app with react-native-actions-sheet.
 * @see https://rnas.vercel.app/docs/usage/registering-sheets
 */
import { registerSheet, type SheetDefinition } from 'react-native-actions-sheet'

import { DeviceSettingsSheet } from '@/components/sheets/device-settings'


registerSheet('device-settings', DeviceSettingsSheet)

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    'device-settings': SheetDefinition<{
      payload: DeviceSettingsSheet.Props
    }>
  }
}

// export {}
