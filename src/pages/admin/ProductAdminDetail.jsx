// src/pages/admin/ProductAdminDetail.jsx

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, CircularProgress, Paper, Chip, Button } from '@mui/material'

const ProductAdminDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`)
        setProduct(data)
      } catch (error) {
        console.error('⛔ Error al obtener producto:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading)
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    )

  if (!product) return <Typography>Producto no encontrado</Typography>

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📦 Detalle del Producto
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          maxWidth: 600,
          mx: 'auto', // centra horizontalmente
        }}
      >
        <Typography>
          <strong>ID:</strong> {product._id}
        </Typography>
        <Typography>
          <strong>Nombre:</strong> {product.nombre}
        </Typography>
        <Typography>
          <strong>Precio:</strong> ${product.precio.toLocaleString('es-CO')}
        </Typography>
        <Typography>
          <strong>Inventario:</strong> {product.inventario}
        </Typography>
        <Typography>
          <strong>Vendidos:</strong> {product.sold}
        </Typography>
        <Typography>
          <strong>Categoría:</strong> {product.categoria}
        </Typography>
        <Typography>
          <strong>Vendedor:</strong> {product.vendedor}
        </Typography>
        <Typography sx={{ my: 1 }}>
          <strong>Activo:</strong>{' '}
          <Chip
            label={product.activo ? 'Sí' : 'No'}
            color={product.activo ? 'success' : 'default'}
            size="small"
          />
        </Typography>
        <Typography>
          <strong>Creado:</strong> {new Date(product.createdAt).toLocaleDateString()}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Imágenes:</strong>
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mt={1} justifyContent="center">
          {product.imagen?.map((img) => (
            <img
              key={img.public_id}
              src={img.url}
              alt="img"
              width={120}
              height={120}
              style={{ borderRadius: 8 }}
            />
          ))}
        </Box>
      </Paper>

      <Box textAlign="center">
        <Button variant="outlined" component={Link} to="/admin/products">
          ← Volver a la lista
        </Button>
      </Box>
    </Box>
  )
}

export default ProductAdminDetail
