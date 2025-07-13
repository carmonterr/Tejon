import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Grid,
} from '@mui/material'

import { useParams, useNavigate } from 'react-router-dom'
import { uploadImage } from '../../utils/uploadImage'
import api from '../../utils/axios'

const tallas = [35, 36, 37, 38, 39, 40]
const categorias = ['Juvenil', 'Dama', 'Señorial']

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [productData, setProductData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    imagen: [],
    tallasDisponibles: [],
    categoria: '',
    vendedor: '',
    inventario: '',
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const editing = Boolean(id)

  useEffect(() => {
    if (editing) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`)
          setProductData(data)
          if (Array.isArray(data.imagen)) {
            const urls = data.imagen.map((img) => img.url || img)
            setImagePreviews(urls)
          }
        } catch (err) {
          console.error('⛔ Error al obtener producto:', err)
        }
      }
      fetchProduct()
    }
  }, [id, editing])

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    setImagePreviews(files.map((file) => URL.createObjectURL(file)))
  }

  const handleTallaToggle = (talla) => {
    const updatedTallas = productData.tallasDisponibles.includes(talla)
      ? productData.tallasDisponibles.filter((t) => t !== talla)
      : [...productData.tallasDisponibles, talla]

    setProductData({ ...productData, tallasDisponibles: updatedTallas })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      let imagenUrls = productData.imagen

      if (imageFiles.length > 0) {
        const uploads = await Promise.all(imageFiles.map((file) => uploadImage(file)))
        imagenUrls = uploads
      }

      const payload = {
        ...productData,
        precio: parseFloat(productData.precio),
        inventario: parseInt(productData.inventario, 10),
        imagen: imagenUrls, // ✅ Guardar imagen correctamente
      }

      if (editing) {
        await api.put(`/products/${id}`, payload, config)
        alert('✅ Producto actualizado correctamente')
      } else {
        await api.post('/products', payload, config)
        alert('✅ Producto creado correctamente')
      }

      navigate('/admin/products')
    } catch (err) {
      console.error('⛔ Error al guardar:', err)
      alert('Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editing ? 'Editar producto' : 'Crear nuevo producto'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              required
              value={productData.nombre}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Precio"
              name="precio"
              type="number"
              fullWidth
              required
              value={productData.precio}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              multiline
              rows={3}
              fullWidth
              required
              value={productData.descripcion}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Vendedor"
              name="vendedor"
              fullWidth
              required
              value={productData.vendedor}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Inventario"
              name="inventario"
              type="number"
              fullWidth
              required
              value={productData.inventario}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={12}>
            <FormControl component="fieldset">
              <FormLabel>Categoría</FormLabel>
              <RadioGroup
                row
                name="categoria"
                value={productData.categoria}
                onChange={handleChange}
              >
                {categorias.map((cat) => (
                  <FormControlLabel key={cat} value={cat} control={<Radio />} label={cat} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <FormControl component="fieldset">
              <FormLabel>Tallas Disponibles</FormLabel>
              <FormGroup row>
                {tallas.map((t) => (
                  <FormControlLabel
                    key={t}
                    control={
                      <Checkbox
                        checked={productData.tallasDisponibles.includes(t)}
                        onChange={() => handleTallaToggle(t)}
                      />
                    }
                    label={t}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <Button component="label" variant="outlined" fullWidth>
              Subir Imágenes
              <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
            </Button>
            {imagePreviews.length > 0 && (
              <Box mt={2}>
                {imagePreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i}`}
                    width="100%"
                    style={{ maxHeight: 300, marginBottom: 10 }}
                  />
                ))}
              </Box>
            )}
          </Grid>

          <Grid xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Guardando...' : editing ? 'Actualizar producto' : 'Crear producto'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default ProductForm
