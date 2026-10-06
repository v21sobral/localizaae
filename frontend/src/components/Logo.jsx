import { useEffect, useState } from 'react'
import logoLightSrc from '../assets/logo-animated.gif'
import logoDarkSrc from '../assets/logo-animated-dark.gif'
import { getTheme, subscribe } from '../theme'
export default function Logo({ variant = 'light' }) {
  const [isDark, setIsDark] = useState(() => getTheme() === 'dark')
  useEffect(() => {
    return subscribe(() => setIsDark(getTheme() === 'dark'))
  }, [])
  const height = variant === 'compact' ? 70 : variant === 'hero' ? 148 : 115
  return (
    <img
      src={isDark ? logoDarkSrc : logoLightSrc}
      alt="Localiza Aê — Achou, Registrou, Localizou!"
      style={{ height, width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  )
}
