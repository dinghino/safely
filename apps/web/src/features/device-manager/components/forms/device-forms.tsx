import { useState } from 'react'
import { api } from '@workspace/backend/api'
import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'

import type { Device } from '@/entities/device/types'

import { DeviceInfoForm, EditDeviceOptionsForm } from '@/features/device-manager/components'

export function EditDeviceForm({ trigger, device }: { trigger: React.ReactNode; device: Device }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <Tabs defaultValue="info" className="@container w-full">
        <SheetContent className="flex h-full w-full flex-col gap-0 md:max-w-xl" side="right">
          <SheetHeader className="gap-4 border-b">
            <div>
              <SheetTitle>Device configuration</SheetTitle>
              <SheetDescription>Update device settings and information</SheetDescription>
            </div>
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </SheetHeader>

          {/* <div className="border-border border-b p-4"></div> */}

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <TabsContent value="info" className="gap-2">
              <DeviceInfoForm device={device} onSubmitted={() => setOpen(false)} />
            </TabsContent>
            <TabsContent value="settings" className="space-y-2">
              <EditDeviceOptionsForm device={device} />
            </TabsContent>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Tabs>
    </Sheet>
  )
}
