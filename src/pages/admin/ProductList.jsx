import React, { useEffect, useState } from 'react'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  TablePagination,
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../redux/slices/productSlice'
import axios from 'axios'

const ProductList = () => {
  const dispatch = useDispatch()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const productState = useSelector((state) => state.product) || {}

  const products = productState.products || []
  const total = productState.total || 0

  useEffect(() => {
    loadProducts(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm, sortOption, rowsPerPage])

  const loadProducts = (pageNumber = 1) => {
    dispatch(
      fetchProducts({
        search: searchTerm,
        categoria: selectedCategory,
        sort: sortOption,
        page: pageNumber,
        limit: rowsPerPage,
      })
    )
    setCurrentPage(pageNumber)
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token') // Asegúrate de que el token esté guardado
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      loadProducts(currentPage) // recarga productos
    } catch (err) {
      console.error('⛔ Error al eliminar producto:', err)
      alert('No se pudo eliminar el producto.')
    }
  }

  const toggleProductStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, { activo: newStatus })
      loadProducts(currentPage)
    } catch (err) {
      console.error('⛔ Error al cambiar estado:', err)
    }
  }

  const renderStockStatus = (inventario) => {
    if (inventario === 0) return <Chip label="Agotado" color="error" size="small" />
    if (inventario <= 5) return <Chip label={`Bajo (${inventario})`} color="warning" size="small" />
    return <Chip label={`Stock: ${inventario}`} color="success" size="small" />
  }

  return (
    <Box>
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Typography variant="h5">Lista de Productos</Typography>

        <TextField
          size="small"
          label="Buscar producto"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Categoría"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Juvenil">Juvenil</MenuItem>
            <MenuItem value="Dama">Dama</MenuItem>
            <MenuItem value="Señorial">Señorial</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            label="Ordenar por"
          >
            <MenuItem value="newest">Más nuevos</MenuItem>
            <MenuItem value="bestseller">Más vendidos</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" component={Link} to="/admin/products/new">
          Crear producto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Vendidos</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell>Fecha creación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod._id}>
                <TableCell>
                  <Avatar src={prod.imagen?.[0]?.url} alt={prod.nombre} variant="square" />
                </TableCell>
                <TableCell>{prod.nombre}</TableCell>
                <TableCell>${prod.precio}</TableCell>
                <TableCell>{prod.sold || 0}</TableCell>
                <TableCell>{renderStockStatus(prod.inventario)}</TableCell>
                <TableCell>
                  <IconButton
                    color={prod.activo ? 'success' : 'warning'}
                    onClick={() => toggleProductStatus(prod._id, !prod.activo)}
                  >
                    {prod.activo ? <ToggleOnIcon /> : <ToggleOffIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      component={Link}
                      to={`/admin/products/${prod._id}/edit`}
                      title="Editar"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() => handleDelete(prod._id)}
                      title="Eliminar"
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <Button
                      component={Link}
                      to={`/admin/products/${prod._id}`}
                      size="small"
                      variant="text"
                      sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Ver
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={currentPage - 1}
        onPageChange={(e, newPage) => loadProducts(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          loadProducts(1)
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Box>
  )
}

export default ProductList
