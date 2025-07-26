import React, { useState } from 'react'
import { Container, TextField, Button, Typography, Grid, Alert } from '@mui/material'

import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    try {
      setLoading(true)
      await API.post('api/users/register', formData)

      setSuccess('✅ Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.')
      setTimeout(() => navigate('/verify-email'), 2000)
    } catch (err) {
      console.error(err)
      const res = err.response?.data

      if (res?.code === 'VALIDATION_ERROR' && Array.isArray(res.errors)) {
        const formatted = {}
        res.errors.forEach((e) => {
          formatted[e.field] = e.message
        })
        setFieldErrors(formatted)
      } else {
        setError(res?.message || 'Error al registrarse')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Crear cuenta
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
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid item xs={12}>
            <TextField
              label="Nombre completo"
              name="name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
            />
          </Grid>

          {/* Correo */}
          <Grid item xs={12}>
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
          </Grid>

          {/* Contraseña */}
          <Grid item xs={12}>
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
          </Grid>

          {/* Botón */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth disabled={loading} size="large">
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

export default RegisterPage
