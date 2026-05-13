export const useTheme = () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (mode: 'light' | 'dark' | 'system') => {
    colorMode.preference = mode
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    colorMode
  }
}
