export namespace Conditional {
  export type Props = {
    if: boolean | null | undefined
    /**
     * Content to render if the condition is false.
     * @default null
     */
    else?: React.ReactNode
    children: React.ReactNode
  }
}
/**
 * A simple component that conditionally renders its children based on the `if` prop,
 * with an optional `else` prop for alternative content (defaults to `null`).
 * from @dinghino This exists because I personally hate using ternary operators in JSX and this
 * allows me to collapse code blocks cleanly
 */
export function Conditional(props: Conditional.Props) {
  const { if: condition, else: elseContent = null, children } = props
  return condition ? children : elseContent
}
