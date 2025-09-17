// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import { DashboardHero } from './dashboard.hero'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DeviceManager } from '@/features/device-manager'

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
    <main className="content-grid">
      <DashboardHero />
      <div>{/* <DeviceInfoComponent /> */}</div>
      <Card>
        <CardHeader>Device Manager</CardHeader>
        <CardContent>
          <DeviceManager />
        </CardContent>
      </Card>
    </main>
  )
}
