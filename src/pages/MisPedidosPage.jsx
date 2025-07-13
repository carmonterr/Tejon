import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Chip,
  Button,
  TextField,
  Pagination,
  Stack,
} from '@mui/material'
import { Link } from 'react-router-dom'

import API from '../api/axios'
import { toast } from 'react-toastify'

const MisPedidosPage = () => {
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 5

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('api/orders/mine', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        // Ordenar: más recientes primero
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(sorted)
        setFiltered(sorted)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar tus pedidos')
        toast.error('No se pudieron cargar tus pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user.token])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    const filteredList = orders.filter(
      (order) =>
        order._id.toLowerCase().includes(value.toLowerCase()) ||
        order.totalPrice.toString().includes(value)
    )
    setFiltered(filteredList)
    setPage(1) // reiniciar a la página 1 al buscar
  }

  const paginatedOrders = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading)
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    )

  if (error)
    return (
      <Typography textAlign="center" sx={{ mt: 4 }} color="error">
        {error}
      </Typography>
    )

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        🧾 Mis pedidos
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField label="Buscar por ID o total" value={search} onChange={handleSearch} fullWidth />
      </Box>

      {filtered.length === 0 ? (
        <Typography>No hay pedidos que coincidan.</Typography>
      ) : (
        <>
          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Entrega</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.slice(-6)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.isPaid ? 'Pagado ✅' : 'Esperando pago'}
                        color={order.isPaid ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.deliveryStatus === 'entregado'
                            ? 'Entregado'
                            : order.deliveryStatus === 'en tránsito'
                              ? 'Viajando a su destino'
                              : 'Esperando envío'
                        }
                        color={
                          order.deliveryStatus === 'entregado'
                            ? 'primary'
                            : order.deliveryStatus === 'en tránsito'
                              ? 'info'
                              : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/pedido/${order._id}`}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Stack spacing={2} alignItems="center" mt={3}>
            <Pagination
              count={Math.ceil(filtered.length / perPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Stack>
        </>
      )}
    </Container>
  )
}

export default MisPedidosPage
