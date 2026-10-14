import { useEffect } from 'react'
import type { ThemeMode } from '@/types'

function applyResolvedTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#18181b' : '#ffffff')
}

export function useThemeMode(themeMode: ThemeMode) {
  useEffect(() => {
    if (themeMode !== 'system') {
      applyResolvedTheme(themeMode === 'dark')
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      applyResolvedTheme(mediaQuery.matches)
    }

    handleSystemThemeChange()
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [themeMode])
}
