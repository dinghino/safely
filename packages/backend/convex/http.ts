/** @format */

import type { WebhookEvent } from '@clerk/backend'
import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text()
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook event', error)
    return null
  }
}

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request)
  if (!event) {
    return new Response('Error occured', { status: 400 })
  }
  switch (event.type) {
    case 'user.created': // intentional fallthrough
    case 'user.updated':
      await ctx.runMutation(internal.users.clerk.upsert, {
        data: event.data,
      })
      break

    case 'user.deleted': {
      const clerkUserId = event.data.id!
      await ctx.runMutation(internal.users.clerk.remove, { clerkUserId })
      break
    }
    default:
      console.log('Ignored Clerk webhook event', event.type)
  }

  return new Response(null, { status: 200 })
})

const http = httpRouter()

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
})

const handleGetIpLocation = httpAction(async (_ctx, request) => {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

  // Default fallback (Rome, Italy)
  const fallback = { lat: 41.9028, lng: 12.4964, zoom: 12 }

  if (!ip) {
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const fields = [
    'status',
    'message',
    'country',
    'countryCode',
    'region',
    'regionName',
    'city',
    'zip',
    'lat',
    'lon',
    'timezone',
    'proxy',
    'query'
  ]


  try {
    // We use the free endpoint of ip-api.com which does not require an API key
    // limitations: 45 requests per minute from the same IP
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=${fields.join(',')}`)
    const data = await response.json()

    if (data.status === 'success') {
      const { lat, lon: lng, ...rest } = data
      return new Response(
        JSON.stringify({ lat, lng, zoom: 13, ...rest }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      )
    }

    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to fetch IP location', error)
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
})

http.route({
  path: '/get-ip-location',
  method: 'GET',
  handler: handleGetIpLocation,
})

export default http

// whsec_ZsOw/5e9rNdKx7GWvekAID0VdDRekGLm
