export default function MapToolbarLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return <div className="z-10 h-fit bg-red-500/10 px-4 py-2">{children}</div>
}
