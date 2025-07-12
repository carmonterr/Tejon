import React, { useEffect, useState } from 'react'
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material'
import axios from 'axios'
import { toast } from 'react-toastify'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [attemptsInfo, setAttemptsInfo] = useState(null)
  const [isBlocked, setIsBlocked] = useState(false)

  // ✅ Al cargar el componente, verificamos si hay bloqueo en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('forgotPasswordBlock')
    if (stored) {
      const parsed = JSON.parse(stored)
      const today = new Date().toDateString()

      if (parsed.date === today && parsed.isBlocked) {
        setIsBlocked(true)
        setAttemptsInfo({ used: 3, max: 3 }) // Puedes ajustar según tu lógica
      } else {
        localStorage.removeItem('forgotPasswordBlock') // Limpia si ya pasó el día
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldError(null)
    setAttemptsInfo(null)

    try {
      setLoading(true)

      await axios.post('http://localhost:5000/api/users/forgot-password', { email })

      setSuccess('📧 Te enviamos un correo con las instrucciones para recuperar tu contraseña.')
      toast.success('Correo enviado correctamente.')
    } catch (err) {
      const res = err.response?.data

      if (res?.code === 'VALIDATION_ERROR' && Array.isArray(res.errors)) {
        const emailErr = res.errors.find((e) => e.field === 'email')
        if (emailErr) setFieldError(emailErr.message)
      } else if (res?.code === 'EMAIL_NOT_FOUND') {
        toast.error('Correo no registrado')
        setError(res.message)
      } else if (res?.code === 'RESET_ATTEMPTS_EXCEEDED') {
        const used = res.errors?.attemptsUsed || 3
        const max = res.errors?.maxAttempts || 3

        toast.warning(`⚠️ Ya alcanzaste los ${used}/${max} intentos hoy.`)
        setError(res.message)
        setAttemptsInfo({ used, max })
        setIsBlocked(true)

        // 🔐 Guardar bloqueo en localStorage
        localStorage.setItem(
          'forgotPasswordBlock',
          JSON.stringify({ isBlocked: true, date: new Date().toDateString() })
        )
      } else {
        const msg = res?.message || 'Error al enviar el correo'
        toast.error(msg)
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recuperar Contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isBlocked && attemptsInfo && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Has usado <strong>{attemptsInfo.used}</strong> de {attemptsInfo.max} intentos hoy.
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldError}
            helperText={fieldError}
            disabled={isBlocked}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || isBlocked}
            sx={{ mt: 2 }}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default ForgotPasswordPage
