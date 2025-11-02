export const STORE_KEY = {
  DEVICE_ID: 'deviceId',
  DEVICE: 'device',
  DEVICE_SESSION_TOKEN: '__device_session_token',
  // this has been extracted from the clerk sdk default storage key. hopefully
  // it remains stable!
  CLERK_JWT: '__clerk_client_jwt'
} as const
