// src/theme.js
import { createTheme } from '@mui/material/styles'

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#d32f2f',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
    },
    shape: {
      borderRadius: 8,
    },
  })
