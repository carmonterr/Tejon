import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useTheme } from '@mui/material/styles'

import AdminSidebar from '../../components/admin/AdminSidebar'

const AdminLayout = () => {
  const theme = useTheme()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex' }}>
        <AdminSidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            minHeight: '100vh', // asegura que el contenido ocupe toda la altura visible
            backgroundColor:
              theme.palette.mode === 'light'
                ? '#f9f9f9' // fondo limpio en modo claro
                : theme.palette.background.default, // usa el fondo por defecto en modo oscuro

            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default AdminLayout
