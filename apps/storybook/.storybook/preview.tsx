import type { Preview } from '@storybook/nextjs-vite'
import { ThemeProvider } from '@workspace/ui/providers/theme-provider'
import '@workspace/ui/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story) => <Story />,
    // fixme: we need to be able to switch theme from the toolbar
    // (Story) => (,
    //   <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    //     <Story />
    //   </ThemeProvider>
    // ),
  ],
}

export default preview
