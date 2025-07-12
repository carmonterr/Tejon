// src/pages/PedidoDetalle.jsx
import React, { useEffect, useState } from 'react'
import { Typography, Box, CircularProgress, Chip, Stack, Divider } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import ComprobantePedido from '../components/ComprobantePedido'

const PedidoDetalle = () => {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setPedido(data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al cargar pedido')
        setPedido(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPedido()
  }, [id, user.token])

  if (loading)
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    )

  if (!pedido) {
    return (
      <Typography textAlign="center" sx={{ mt: 5 }} color="error">
        No se pudo cargar el pedido.
      </Typography>
    )
  }

  // Puedes seguir con el resto del JSX que renderiza el pedido...

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pedido #{pedido._id.slice(-6)}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          label={pedido.isPaid ? 'Pagado' : 'Esperando pago'}
          color={pedido.isPaid ? 'success' : 'warning'}
          size="small"
        />
        <Chip
          label={
            pedido.deliveryStatus === 'entregado'
              ? 'Entregado ✅'
              : pedido.deliveryStatus === 'en tránsito'
                ? 'Viajando a su destino'
                : 'Esperando envío'
          }
          color={
            pedido.deliveryStatus === 'entregado'
              ? 'primary'
              : pedido.deliveryStatus === 'en tránsito'
                ? 'info'
                : 'default'
          }
          size="small"
        />
        <Typography sx={{ ml: 2, color: 'gray' }}>
          Fecha: {new Date(pedido.createdAt).toLocaleDateString()}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <ComprobantePedido pedido={pedido} user={user} />
    </Box>
  )
}

export default PedidoDetalle
