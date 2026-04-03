import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggle, isDark: theme === 'dark' }
}
