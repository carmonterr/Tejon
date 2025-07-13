import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import API from '../../api/axios'

const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [orderStats, setOrderStats] = useState({ totalPedidos: 0, totalVentas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resUsers, resOrders] = await Promise.all([
          API.get('/products', {
            params: { page: 1, limit: 1000 },
          }),
          API.get('/admin/users/count'),
          API.get('/admin/orders/summary'),
        ])

        const productosData = Array.isArray(resProducts.data.products)
          ? resProducts.data.products
          : resProducts.data

        setProducts(productosData)
        setUsersCount(resUsers.data.totalUsers || 0)
        setOrderStats({
          totalPedidos: resOrders.data.totalPedidos || 0,
          totalVentas: resOrders.data.totalVentas || 0,
        })
      } catch (err) {
        console.error('⛔ Error al cargar datos del dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // 🔄 Limpiamos [token], ya no se usa

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.inventario === 0).length

  const statCards = [
    {
      title: 'Productos',
      value: totalProducts,
      color: '#4CAF50',
      link: '/admin/products',
      linkText: 'Ver productos',
    },
    {
      title: 'Agotados',
      value: outOfStock,
      color: '#FFC107',
      link: '/admin/products?filter=agotados',
      linkText: 'Ver agotados',
    },
    {
      title: 'Usuarios',
      value: usersCount,
      color: '#03A9F4',
      link: '/admin/users',
      linkText: 'Ver usuarios',
    },
    {
      title: 'Pedidos',
      value: orderStats.totalPedidos,
      color: '#9C27B0',
      link: '/admin/orders',
      linkText: 'Ver pedidos',
    },
    {
      title: 'Ventas',
      value: `$${(orderStats.totalVentas || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 2,
      })}`,
      color: '#FF5722',
      link: '/admin/ventas',
      linkText: 'Ver más',
    },
  ]

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Bienvenido. Desde aquí puedes gestionar la tienda.
      </Typography>

      <Grid container spacing={3} columns={12} sx={{ mt: 2 }}>
        {statCards.map((item, index) => (
          <Grid
            key={index}
            sx={{
              gridColumn: {
                xs: 'span 12',
                sm: 'span 6',
                md: 'span 3',
              },
            }}
          >
            <Card
              sx={{
                backgroundColor: item.color,
                color: 'white',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {item.value}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  to={item.link}
                  sx={{
                    backgroundColor: 'white',
                    color: item.color,
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                  fullWidth
                >
                  {item.linkText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard
