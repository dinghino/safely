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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'

export default function Dashboard() {
  return (
    <main className="max-w-full py-4 content-grid">
      <DashboardHero />
      {/* <div className="inline-flex"> */}
      <section className="grid grid-cols-12 gap-4">
        <Card
          className={cn(
            'col-span-full md:col-span-full lg:col-span-10',
            'px-0 pb-0',
            'overflow-hidden',
          )}
        >
          <Tabs className="h-full" defaultValue='map'>
            <CardHeader className="flex flex-row justify-between">
              <div className="space-y-1">
                <CardTitle className="font-bold text-lg">Your devices</CardTitle>
                <CardDescription>Glance at where your devices are</CardDescription>
              </div>

              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="h-full px-0 pb-0">
              <TabsContent value="table" className="px-6">
                <DevicesTable />
              </TabsContent>
              <TabsContent value="map" className="h-full px-0 pb-0">
                <LastKnownLocationMap />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <aside className={cn('col-span-full lg:col-span-4 xl:col-span-2', 'flex flex-col gap-4')}>
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
