import { useThemeStore } from '@/store/themeStore'

beforeEach(() => {
  useThemeStore.setState({ theme: 'light' })
})

describe('themeStore', () => {
  it('has "light" as the initial theme', () => {
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggles from light to dark', () => {
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('toggles from dark back to light', () => {
    useThemeStore.setState({ theme: 'dark' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggles correctly multiple times', () => {
    useThemeStore.getState().toggle() // light → dark
    useThemeStore.getState().toggle() // dark → light
    useThemeStore.getState().toggle() // light → dark
    expect(useThemeStore.getState().theme).toBe('dark')
  })
})
