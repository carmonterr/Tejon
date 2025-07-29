import React, { useState, useEffect } from 'react'
import { Container, Typography, TextField, Grid, Button, Alert } from '@mui/material'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'
import ModalPedido from '../components/ModalPedido'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../redux/slices/cartSlice'
import { toast } from 'react-toastify'

const ShippingScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cartItems } = useSelector((state) => state.cart)

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    country: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  // Precargar datos si existen
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const token = user?.token

        const { data } = await API.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })

        setFormData({
          phone: data.phone || '',
          address: data.shippingAddress?.address || '',
          city: data.shippingAddress?.city || '',
          country: data.shippingAddress?.country || '',
        })
      } catch (err) {
        console.error('❌ Error al precargar dirección:', err)
      }
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { phone, address, city, country } = formData

    if (
      typeof phone !== 'string' ||
      phone.trim() === '' ||
      typeof address !== 'string' ||
      address.trim() === '' ||
      typeof city !== 'string' ||
      city.trim() === '' ||
      typeof country !== 'string' ||
      country.trim() === ''
    ) {
      setError('⚠️ Todos los campos son obligatorios')
      return
    }

    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user'))
      const token = user?.token

      console.log('👉 Enviando a backend:', formData) // 👈 IMPORTANTE para debug
      console.log('🌐 PATCHing to:', API.defaults.baseURL + '/users/profile')
      console.log('📤 Payload a enviar:', formData)

      await API.patch('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success('✅ Dirección guardada con éxito')
      setOpenModal(true)
    } catch (err) {
      console.error('❌ Error al guardar dirección:', err)
      setError('Error al guardar la dirección de envío.')
    } finally {
      setLoading(false)
    }
  }

  const transformCartItems = () => {
    return cartItems.flatMap((item) =>
      item.tallas.map((t) => ({
        nombre: item.name,
        talla: t.talla,
        precio: item.price,
        cantidad: t.qty,
      }))
    )
  }

  const handleConfirmarPedido = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const token = user?.token

    const orderItems = cartItems.flatMap((item) =>
      item.tallas.map((t) => ({
        name: item.name,
        qty: t.qty,
        talla: t.talla,
        price: item.price,
        image: item.imagen,
        product: item._id,
      }))
    )

    try {
      await API.post(
        '/api/orders',
        {
          orderItems,
          shippingPrice: 0,
          totalPrice: orderItems.reduce((acc, i) => acc + i.price * i.qty, 0),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      toast.success('✅ Pedido realizado correctamente')
      dispatch(clearCart())
      navigate('/pedido-exitoso')
    } catch (err) {
      console.error('⛔ Error al confirmar pedido:', err)
      toast.error('Error al confirmar pedido')
    } finally {
      setOpenModal(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dirección de Envío
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Teléfono"
              name="phone"
              fullWidth
              required
              inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Dirección"
              name="address"
              fullWidth
              required
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ciudad"
              name="city"
              fullWidth
              required
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="País"
              name="country"
              fullWidth
              required
              value={formData.country}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth disabled={loading} size="large">
              {loading ? 'Guardando...' : 'Guardar y continuar'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <ModalPedido
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmarPedido}
        carrito={transformCartItems()}
        direccion={formData}
      />
    </Container>
  )
}

export default ShippingScreen
