import React, { useEffect, useState } from 'react'
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material'

import API from '../api/axios'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/userSlice'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState(null)

  // Al cargar el componente, verificamos si hay bloqueo en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('loginBlock')
    if (stored) {
      const parsed = JSON.parse(stored)
      const blockedTime = new Date(parsed.until)
      const now = new Date()

      if (blockedTime > now) {
        setIsBlocked(true)
        setBlockedUntil(blockedTime)

        const minutes = Math.ceil((blockedTime - now) / (60 * 1000))
        toast.warning(`🚫 Estás bloqueado. Intenta de nuevo en ${minutes} min.`)
      } else {
        localStorage.removeItem('loginBlock')
      }
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    try {
      const res = await API.post('api/users/login', formData)

      // ✅ Login exitoso
      dispatch(loginSuccess(res.data))
      localStorage.setItem('user', JSON.stringify(res.data))
      localStorage.removeItem('loginBlock') // limpiar bloqueo si existía
      toast.success(`Bienvenido ${res.data.name}`)
      navigate('/')
    } catch (error) {
      const res = error.response?.data

      if (res?.code === 'VALIDATION_ERROR' && Array.isArray(res.errors)) {
        const formatted = {}
        res.errors.forEach((err) => {
          formatted[err.field] = err.message
        })
        setFieldErrors(formatted)
      } else if (res?.code === 'INVALID_CREDENTIALS') {
        toast.error('❌ Correo o contraseña incorrectos.')
      } else if (res?.code === 'LOGIN_BLOCKED') {
        const until = res.errors?.blockedUntil || res.blockedUntil
        if (until) {
          const parsedUntil = new Date(until)
          setIsBlocked(true)
          setBlockedUntil(parsedUntil)
          localStorage.setItem('loginBlock', JSON.stringify({ until }))

          const minutes = Math.ceil((parsedUntil - new Date()) / (60 * 1000))
          toast.warning(`🚫 Estás bloqueado. Intenta de nuevo en ${minutes} min.`)
        }
      } else if (res?.message?.toLowerCase().includes('verificar')) {
        toast.error(res.message)
        navigate('/verify-email')
      } else {
        toast.error(res?.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Iniciar sesión
        </Typography>

        {/* 🔒 Alerta visual en pantalla */}
        {isBlocked && blockedUntil && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Has superado el límite de intentos. Intenta nuevamente a las{' '}
            <strong>
              {new Date(blockedUntil).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Correo"
            name="email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={isBlocked}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            disabled={isBlocked}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || isBlocked}
            sx={{ mt: 2 }}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Olvidaste tu contraseña? <Link to="/forgot-password">Recuperar acceso</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  )
}

export default LoginPage
