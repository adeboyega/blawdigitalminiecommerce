import { render } from '@testing-library/react'
import ThemeProvider from '@/components/ThemeProvider'
import { useThemeStore } from '@/store/themeStore'

beforeEach(() => {
  useThemeStore.setState({ theme: 'light' }, true)
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
})

describe('ThemeProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <span>Hello</span>
      </ThemeProvider>
    )
    expect(getByText('Hello')).toBeInTheDocument()
  })

  it('adds "dark" class to <html> when theme is dark', () => {
    useThemeStore.setState({ theme: 'dark' }, true)
    render(<ThemeProvider><span /></ThemeProvider>)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes "dark" class from <html> when theme is light', () => {
    document.documentElement.classList.add('dark')
    useThemeStore.setState({ theme: 'light' }, true)
    render(<ThemeProvider><span /></ThemeProvider>)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
