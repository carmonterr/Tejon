import React, { useState } from 'react'
import { Container, TextField, Button, Typography, Grid, Alert } from '@mui/material'

import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

const VerifyEmailPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    code: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setLoading(true)

      await API.post('api/users/verify-email', formData)

      setSuccess('✅ Cuenta verificada correctamente.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Error al verificar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Verificar correo electrónico
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
          <Grid item xs={12}>
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Código de verificación"
              name="code"
              fullWidth
              required
              value={formData.code}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

export default VerifyEmailPage
