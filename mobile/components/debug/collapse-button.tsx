import { useColorScheme } from 'nativewind'
import { Button } from '../ui/button'

export const Trigger = ({ children, ...props }: { children: React.ReactNode }) => {
  const { colorScheme } = useColorScheme()

  return (
    <Button
      variant={colorScheme === 'dark' ? 'outline' : 'secondary'}
      className="justify-start gap-2"
      {...props}
    >
      {children}
    </Button>
  )
}
