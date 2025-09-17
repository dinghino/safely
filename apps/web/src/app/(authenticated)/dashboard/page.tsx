// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import { DashboardHero } from './dashboard.hero'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { DeviceManager } from '@/features/device-manager'
import { DevicesTable } from '@/features/device-manager/components'

export default function Dashboard() {
  return (
    <>
      {/* <Authenticated> */}
      <AuthContent />
      {/* </Authenticated>
      <Unauthenticated>
        {null}
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading> */}
    </>
  )
}

function AuthContent() {
  return (
    <main className="py-4 content-grid">
      <DashboardHero />
      {/* <div><DeviceInfoComponent /></div> */}
      <Card>
        <CardHeader>Device Manager</CardHeader>
        <CardContent>
          <DeviceManager />
          <DevicesTable />
        </CardContent>
      </Card>
    </main>
  )
}
