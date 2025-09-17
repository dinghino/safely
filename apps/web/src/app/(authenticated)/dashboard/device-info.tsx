'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeviceInfo } from '@/features/device-manager/hooks'


export default function DeviceInfoComponent() {
  const deviceInfo = useDeviceInfo()

  if (!deviceInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load device information</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-semibold text-muted-foreground text-sm">Device Identity</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Device ID:</span>
                <span className="ml-2 rounded bg-muted px-2 py-1 font-mono text-xs">
                  {deviceInfo.deviceId}
                </span>
              </div>
              <div>
                <span className="font-medium">Platform:</span>
                <span className="ml-2">{deviceInfo.platform}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold text-muted-foreground text-sm">System</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Language:</span>
                <span className="ml-2">{deviceInfo.language}</span>
              </div>
              <div>
                <span className="font-medium">Timezone:</span>
                <span className="ml-2">{deviceInfo.timezone}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold text-muted-foreground text-sm">Status</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Online:</span>
                <span
                  className={`ml-2 ${deviceInfo.onlineStatus ? 'text-green-600' : 'text-red-600'}`}
                >
                  {deviceInfo.onlineStatus ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Cookies:</span>
                <span
                  className={`ml-2 ${deviceInfo.cookieEnabled ? 'text-green-600' : 'text-red-600'}`}
                >
                  {deviceInfo.cookieEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h4 className="mb-2 font-semibold text-muted-foreground text-sm">User Agent</h4>
          <p className="break-all rounded bg-muted p-2 font-mono text-xs">{deviceInfo.userAgent}</p>
        </div>
      </CardContent>
    </Card>
  )
}
