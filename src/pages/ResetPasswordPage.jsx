import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material'

import API from '../api/axios'
import { toast } from 'react-toastify'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldError(null)

    if (password !== confirmPassword) {
      setError('❌ Las contraseñas no coinciden')
      return
    }

    try {
      await API.post(`api/users/reset-password/${token}`, {
        password,
      })

      toast.success('Contraseña actualizada correctamente')
      setSuccess('✅ Redirigiendo al inicio de sesión...')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const res = err.response?.data

      if (res?.code === 'VALIDATION_ERROR' && Array.isArray(res.errors)) {
        const passErr = res.errors.find((e) => e.field === 'password')
        if (passErr) setFieldError(passErr.message)
      } else if (res?.code === 'TOKEN_INVALIDO' || res?.message?.toLowerCase().includes('token')) {
        toast.error('Token inválido o expirado')
        setError(res.message)
      } else {
        const message = res?.message || 'Error al actualizar la contraseña'
        toast.error(message)
        setError(message)
      }
    }
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Restablecer Contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldError}
            helperText={fieldError}
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Cambiar contraseña
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default ResetPasswordPage
