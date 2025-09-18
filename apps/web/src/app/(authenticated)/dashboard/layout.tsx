import { DeviceManager } from '@/features/device-manager'

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DeviceManager />
      {children}
    </>
  )
}
