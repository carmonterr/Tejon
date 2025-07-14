// src/layouts/MainLayout.jsx
import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffffff', // fondo blanco fijo para modo claro
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <Outlet />
    </Box>
  )
}

export default MainLayout
