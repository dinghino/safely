// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { RegisterDeviceButton } from '@/features/device-tracking'
import { CreateTodoForm, TodosList } from '@/features/todos/components'
import { DevicesTable } from '@/widgets/devices-table'
import { DashboardHero } from './dashboard.hero'

export default function Dashboard() {
  return (
    <main className="max-w-full py-4 content-grid">
      <DashboardHero />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle className="font-bold text-lg">Device Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <DevicesTable />
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4 xl:col-span-2">
          <RegisterDeviceButton className="self-end" />
          <Card className="h-full">
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                {/* <TodosCard /> */}
                <CreateTodoForm />
                <TodosList />
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
