export default function MapToolbarLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <div className="z-10 flex h-fit w-fit flex-row items-center gap-1 bg-background px-4 py-2">
      {children}
    </div>
  )
}
