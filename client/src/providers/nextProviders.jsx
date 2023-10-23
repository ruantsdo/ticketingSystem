//NextUi
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'

export function NextProviders({ children }) {
  return (
    <NextUIProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
        </ThemeProvider>
    </NextUIProvider>
  )
}

export default NextProviders