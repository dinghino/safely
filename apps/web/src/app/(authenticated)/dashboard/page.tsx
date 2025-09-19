// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { DevicesTable } from '@/features/device-manager'
import { DashboardHero } from './dashboard.hero'

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
      {/* <DashboardHero /> */}
      {/* <div><DeviceInfoComponent /></div> */}
      <section>
        <Card>
          <CardHeader>Device Manager</CardHeader>
          <CardContent>
            <DevicesTable />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
