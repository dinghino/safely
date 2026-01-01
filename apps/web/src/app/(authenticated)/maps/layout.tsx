
type Props = {
  children: React.ReactNode
}

export default function MapsLayout(props: Props) {
  const { children } = props
  return (
    <div className="h-full max-h-[calc(100vh-var(--header-height))] w-full">
      {children}
    </div>
  )
}
