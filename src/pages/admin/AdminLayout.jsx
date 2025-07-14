// src/layouts/AdminLayout.jsx
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
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffffff' }}>
        <AdminSidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            backgroundColor: '#00757fff', // 🟢 Fondo uniforme
            minHeight: '100vh',
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
