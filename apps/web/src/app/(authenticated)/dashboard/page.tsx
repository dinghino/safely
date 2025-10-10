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
import { cn } from '@/lib/utils'

export default function Dashboard() {
  return (
    <main className="max-w-full py-4 content-grid">
      <DashboardHero />
      {/* <div className="inline-flex"> */}
      <section className="grid grid-cols-12 gap-4">
        <Card className={cn('col-span-full md:col-span-full lg:col-span-6 xl:col-span-5')}>
          <CardHeader>
            <CardTitle className="font-bold text-lg">Device Manager</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            <DevicesTable />
          </CardContent>
        </Card>
        <Card className={cn('col-span-full lg:col-span-6 xl:col-span-5', 'overflow-hidden pb-0')}>
          <CardHeader>
            <CardTitle>Your devices</CardTitle>
            <CardDescription>Glance at where your devices are</CardDescription>
          </CardHeader>
          <div className="isolate h-full w-full">
            <LastKnownLocationMap />
          </div>
        </Card>
        <aside
          className={cn('col-span-full lg:col-span-4 xl:col-span-2', 'flex flex-col gap-4')}
        >
          <Card className="max-h-fit">
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
      </section>
      {/* </div> */}
    </main>
  )
}
