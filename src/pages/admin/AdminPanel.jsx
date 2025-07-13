import React, { useEffect, useState } from 'react'
import ProductForm from '../../components/admin/ProductForm'
import axios from 'axios'
import { Grid } from '@mui/material'
import ProductCard from '../../components/ProductCard'

const AdminPanel = () => {
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`)
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev])
  }

  return (
    <>
      <ProductForm onProductCreated={handleProductCreated} />

      <Grid spacing={2} columns={12} sx={{ mt: 4 }}>
        {products.map((p) => (
          <Grid key={p._id} xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default AdminPanel
