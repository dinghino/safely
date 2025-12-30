import { InputGroup, InputGroupInput, InputGroupAddon } from '@workspace/ui/components/input-group'
import { Search } from 'lucide-react'

export namespace SearchInput {
  export type Props = React.ComponentProps<typeof InputGroupInput> & {
    children?: React.ReactNode
  }
}
/**
 * Simple extendable search input component using shadcn InputGroup
 */
export function SearchInput(props: SearchInput.Props) {
  const { children, ...rest } = props
  return (
    <InputGroup>
      <InputGroupInput placeholder="Search..." {...rest} />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}
