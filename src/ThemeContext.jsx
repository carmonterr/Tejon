/* eslint-disable react/prop-types */

import React, { createContext, useMemo, useState, useContext, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme'

// 🟣 Contexto para compartir el modo actual y el toggle
const ColorModeContext = createContext()

// ✅ Custom hook para acceder fácilmente al contexto
export const useColorMode = () => useContext(ColorModeContext)

// ✅ Proveedor del modo de tema
export const ThemeModeProvider = ({ children = null }) => {
  const [mode, setMode] = useState('light')

  // 🔁 Cargar modo guardado en localStorage o usar modo del sistema
  useEffect(() => {
    const saved = localStorage.getItem('themeMode')

    if (saved === 'light' || saved === 'dark') {
      setMode(saved)
    } else {
      // ⬇️ Si no hay nada guardado, usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // 🔁 Alternar entre modos y guardar en localStorage
  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', newMode)
      return newMode
    })
  }

  // 🎨 Memoiza el theme según el modo
  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
