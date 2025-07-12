// src/pages/ProfilePage.jsx
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Paper, Button } from '@mui/material'
import { logout } from '../redux/slices/userSlice'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  if (!user) {
    return <Typography variant="h6">Cargando...</Typography>
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 500, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Perfil del Usuario
        </Typography>
        <Typography>
          <strong>Nombre:</strong> {user.name}
        </Typography>
        <Typography>
          <strong>Email:</strong> {user.email}
        </Typography>
        <Typography>
          <strong>Teléfono:</strong> {user.phone}
        </Typography>
        <Typography>
          <strong>Dirección:</strong> {user.address}
        </Typography>

        <Button variant="contained" color="error" sx={{ mt: 3 }} onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </Paper>
    </Box>
  )
}

export default ProfilePage
