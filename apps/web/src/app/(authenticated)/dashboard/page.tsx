// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { DevicesTable } from '@/features/device-manager'
import { RegisterDeviceButton } from '@/features/device-tracking'
// import { DashboardHero } from './dashboard.hero'

export default function Dashboard() {
  return (
    <main className="py-4 content-grid">
      {/* <DashboardHero /> */}
      {/* <div><DeviceInfoComponent /></div> */}
      <section>
        <Card>
          <CardHeader>Device Manager</CardHeader>
          <CardContent>
            <RegisterDeviceButton />
          </CardContent>
          <CardContent>
            <DevicesTable />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
