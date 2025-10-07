import { query } from './_generated/server'

export const healthcheck = query({ handler: async () => 'OK' })
