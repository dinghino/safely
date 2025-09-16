import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="grid h-screen w-full place-items-center">
      <SignIn />
    </div>
  )
}
