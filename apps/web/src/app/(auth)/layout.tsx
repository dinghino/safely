// import { PublicAppHeader } from '@/views/public-app-header'
export type AuthLayoutProps = {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      {/* <PublicAppHeader
        showSignIn={false}
        navigation={[]} // No navigation links for auth layout
        className="bg-background text-foreground absolute z-50 w-full"
      /> */}
      <main className="h-svh overflow-y-auto">{children}</main>
    </>
  )
}
