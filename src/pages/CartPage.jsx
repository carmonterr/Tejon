// src/pages/CartPage.jsx

import React, { useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Select,
  MenuItem,
  Button,
  Divider,
  Box,
  Grid,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromCart, updateQty, clearCart } from '../redux/slices/cartSlice'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ModalPedido from '../components/ModalPedido'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { cartItems } = useSelector((state) => state.cart)

  const [openConfirm, setOpenConfirm] = useState(false)

  const subtotal = cartItems.reduce((acc, item) => {
    const sumPerProduct = item.tallas.reduce((acc2, t) => acc2 + item.price * t.qty, 0)
    return acc + sumPerProduct
  }, 0)

  const shipping = subtotal > 0 ? 9.99 : 0
  const total = subtotal + shipping

  const handleQtyChange = (id, talla, qty) => {
    dispatch(updateQty({ id, talla, qty }))
  }

  const handleRemove = (id, talla) => {
    dispatch(removeFromCart({ id, talla }))
    toast.info('Producto eliminado del carrito')
  }

  const transformCartItems = () => {
    return cartItems.flatMap((item) =>
      item.tallas.map((t) => ({
        nombre: item.name,
        talla: t.talla, // ✅ AÑADIMOS LA TALLA
        precio: item.price,
        cantidad: t.qty,
      }))
    )
  }

  const handleConfirmarPedido = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const token = user?.token

    if (!token) {
      toast.error('Debes iniciar sesión para confirmar el pedido')
      navigate('/login')
      return
    }

    const orderItems = cartItems.flatMap((item) =>
      item.tallas.map((t) => ({
        name: item.name,
        qty: t.qty,
        talla: t.talla,
        price: item.price,
        image: Array.isArray(item.imagen) ? item.imagen[0]?.url : item.imagen,
        product: item._id,
      }))
    )

    try {
      await axios.post(
        'http://localhost:5000/api/orders',
        {
          orderItems,
          shippingPrice: shipping,
          totalPrice: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('✅ Pedido realizado correctamente')
      dispatch(clearCart())
      navigate('/pedido-exitoso')
    } catch (error) {
      console.error('⛔ Error al realizar pedido:', error)
      toast.error('Error al procesar pedido')
    } finally {
      setOpenConfirm(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          startIcon={<ArrowBackIosNewIcon />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Agregar max
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>
        Tu Carrito
      </Typography>

      {cartItems.length === 0 ? (
        <Typography>No tienes productos en el carrito.</Typography>
      ) : (
        <Grid container spacing={4}>
          <Grid xs={12} md={8}>
            {cartItems.map((item) => (
              <Card key={item._id} sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2}>
                  <CardMedia
                    component="img"
                    image={Array.isArray(item.imagen) ? item.imagen[0]?.url : item.imagen}
                    alt={item.name}
                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box flex={1}>
                    <Typography fontWeight="bold">{item.name}</Typography>
                    {item.tallas.map((t) => (
                      <Box key={t.talla} display="flex" alignItems="center" gap={2} mt={1}>
                        <Typography>Talla: {t.talla}</Typography>
                        <Select
                          size="small"
                          value={t.qty}
                          onChange={(e) =>
                            handleQtyChange(item._id, t.talla, parseInt(e.target.value))
                          }
                        >
                          {[...Array(10).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1}>
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
                        <Typography>Subtotal: ${(t.qty * item.price).toLocaleString()}</Typography>
                        <IconButton color="error" onClick={() => handleRemove(item._id, t.talla)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
            ))}
          </Grid>

          <Grid xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen de compra
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>Subtotal: ${subtotal.toLocaleString()}</Typography>
              <Typography>Envío: ${shipping.toFixed(2)}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ${total.toLocaleString()}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setOpenConfirm(true)}
              >
                Realizar pedido
              </Button>

              <Button
                variant="text"
                color="error"
                sx={{ mt: 1 }}
                onClick={() => {
                  dispatch(clearCart())
                  toast.warn('Carrito vaciado')
                }}
              >
                Vaciar carrito
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      <ModalPedido
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmarPedido}
        carrito={transformCartItems()}
      />
    </Container>
  )
}

export default CartPage
