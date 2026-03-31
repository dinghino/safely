type Props = {
  children: React.ReactNode
}
/**
 * Root layout for Places views. Renders category group navigation at the top
 */
export default function RootPlacesLayout(props: Props) {
  const { children } = props
  return <>{children}</>
}
