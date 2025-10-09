// import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
// import DeviceInfoComponent from './device-info'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { CreateTodoForm, TodosList } from '@/features/todos/components'
import { DevicesTable } from '@/widgets/devices-table'
import { DashboardHero } from './dashboard.hero'
import { LastKnownLocationMap } from '@/views/map-last-known-locations'

export default function Dashboard() {
  return (
    <main className="max-w-full gap-4 py-4 content-grid">
      <DashboardHero />
      <div className="inline-flex gap-8 align-start">
        <section className="grid grid-cols-1 gap-2 xl:grid-cols-7">
          <Card className="xl:col-span-5">
            <CardHeader>
              <CardTitle className="font-bold text-lg">Device Manager</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <DevicesTable />
            </CardContent>
          </Card>
          <Card className="overflow-hidden pb-0 xl:col-span-2">
            <CardHeader>
              <CardTitle>Your devices</CardTitle>
              <CardDescription>Glance at where your devices are</CardDescription>
            </CardHeader>
            <div className="h-full w-full">
              <LastKnownLocationMap />
            </div>
          </Card>
        </section>
        <aside className="flex flex-col gap-4 xl:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Todos</CardTitle>
              <CardDescription>Your quick tasks and to-dos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CreateTodoForm />
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {/* <TodosCard /> */}
                <TodosList />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
