import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PaymentIcon from '@mui/icons-material/Payment'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const estados = [
  { value: '', label: 'Todos' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'pendiente', label: 'Pendiente de pago' },
  { value: 'entregado', label: 'Entregado' },
]

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [ventas, setVentas] = useState(0)
  const [loading, setLoading] = useState(true)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const token = localStorage.getItem('token')

  const fetchPedidos = useCallback(
    async (paramsOverride = {}) => {
      try {
        setLoading(true)
        const params = {
          page,
          estado,
          from: from ? from.toISOString().split('T')[0] : '',
          to: to ? to.toISOString().split('T')[0] : '',
          ...paramsOverride,
        }

        const { data } = await API.get('/orders', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        })

        setOrders(data.orders)
        setPage(data.page)
        setPages(data.pages)
        setTotal(data.total)
        setVentas(data.totalVentas)
      } catch (error) {
        toast.error('Error al cargar pedidos')
      } finally {
        setLoading(false)
      }
    },
    [page, estado, from, to, token]
  )

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  const handleBuscar = () => {
    setPage(1)
    fetchPedidos({ search: search.trim() })
  }

  const handleLimpiar = () => {
    setSearch('')
    setEstado('')
    setFrom(null)
    setTo(null)
    setPage(1)
    fetchPedidos({ search: '', estado: '', from: '', to: '' })
  }

  const handlePageChange = (_, val) => {
    setPage(val)
  }

  const marcarComo = async (tipo, id) => {
    try {
      await API.put(
        `/orders/${id}/${tipo}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success(
        tipo === 'pay'
          ? '💰 Pedido pagado'
          : tipo === 'deliver'
            ? '📦 Entregado'
            : tipo === 'transit'
              ? '🚚 En camino'
              : 'Actualizado'
      )
      fetchPedidos()
    } catch {
      toast.error('Error al actualizar el pedido')
    }
  }

  const revertir = async (id) => {
    try {
      await API.put(
        `/orders/${id}/revert`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.info('🔄 Pedido revertido')
      fetchPedidos()
    } catch {
      toast.error('Error al revertir')
    }
  }

  const eliminar = async (id) => {
    try {
      await API.delete(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('🗑 Pedido eliminado')
      fetchPedidos()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading)
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    )

  return (
    <Box sx={{ pt: 3, px: { xs: 2, sm: 3, md: 0 } }}>
      <Typography variant="h4" gutterBottom>
        📦 Pedidos de Usuarios
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Buscar por ID, nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBuscar()
            }}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleBuscar} sx={{ height: 40 }}>
            Buscar
          </Button>
          <Button variant="outlined" onClick={handleLimpiar} sx={{ height: 40 }}>
            Limpiar
          </Button>
          <TextField
            select
            label="Estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value)
              setPage(1)
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {estados.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Desde"
                value={from}
                onChange={(date) => {
                  setFrom(date)
                  setPage(1)
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="Hasta"
                value={to}
                onChange={(date) => {
                  setTo(date)
                  setPage(1)
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
          </LocalizationProvider>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          📊 Estadísticas
        </Typography>
        <Typography>Total pedidos: {total}</Typography>
        <Typography>Total ventas: ${ventas.toLocaleString('es-CO')}</Typography>
      </Paper>

      <Paper sx={{ overflowX: isMobile ? 'auto' : 'visible' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Entrega</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron pedidos.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user?.name}</TableCell>
                  <TableCell>{order.user?.email}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.isPaid ? 'Pagado' : 'Esperando pago'}
                      color={order.isPaid ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.isDelivered
                          ? 'Entregado'
                          : order.deliveryStatus === 'en tránsito'
                            ? 'Viajando a su destino'
                            : 'Pendiente'
                      }
                      color={
                        order.isDelivered
                          ? 'primary'
                          : order.deliveryStatus === 'en tránsito'
                            ? 'info'
                            : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        component={Link}
                        to={`/pedido/${order._id}`}
                      >
                        Ver
                      </Button>

                      {!order.isPaid && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PaymentIcon />}
                          onClick={() => marcarComo('pay', order._id)}
                        >
                          Pagar
                        </Button>
                      )}

                      {order.isPaid &&
                        order.deliveryStatus !== 'en tránsito' &&
                        !order.isDelivered && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<LocalShippingIcon />}
                            onClick={() => marcarComo('transit', order._id)}
                          >
                            En camino
                          </Button>
                        )}

                      {!order.isDelivered && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => marcarComo('deliver', order._id)}
                        >
                          Entregar
                        </Button>
                      )}

                      {(order.isPaid || order.isDelivered) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<ReplayIcon />}
                          onClick={() => revertir(order._id)}
                        >
                          Revertir
                        </Button>
                      )}

                      {!order.isPaid && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => eliminar(order._id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {pages > 1 && (
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination count={pages} page={page} onChange={handlePageChange} />
        </Box>
      )}
    </Box>
  )
}

export default AdminOrdersPage
