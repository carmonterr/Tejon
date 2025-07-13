import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
  Divider,
  Avatar,
  Modal,
  IconButton,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-toastify'
import axios from 'axios'
import api from '../utils/axios'
import { uploadImage } from '../utils/uploadImage'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.user.user)

  const [product, setProduct] = useState(null)
  const [currentImg, setCurrentImg] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomImg, setZoomImg] = useState(0)
  const [cantidadesPorTalla, setCantidadesPorTalla] = useState({})
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [imagenCliente, setImagenCliente] = useState(null)
  const [preview, setPreview] = useState(null)
  const [puedeOpinar, setPuedeOpinar] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)

      setProduct(data)
      document.title = `${data.nombre} | Tienda MERN`

      const inicial = {}
      data.tallasDisponibles.forEach((t) => {
        inicial[t] = 0
      })
      setCantidadesPorTalla(inicial)
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    const verificarPermiso = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const { data } = await api.get(`/products/${id}/can-review`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setPuedeOpinar(data.canReview)
      } catch (err) {
        console.error('Error al verificar permiso de opinión:', err)
        setPuedeOpinar(false)
      }
    }

    if (userInfo) {
      verificarPermiso()
    }
  }, [id, userInfo])

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.warn('Debes iniciar sesión para agregar al carrito')
      navigate('/login')
      return
    }

    const tallas = Object.entries(cantidadesPorTalla)
      .filter(([, qty]) => qty > 0)
      .map(([talla, qty]) => ({ talla: Number(talla), qty }))

    if (tallas.length === 0) {
      toast.warn('Selecciona al menos una talla con cantidad')
      return
    }

    dispatch(
      addToCart({
        _id: product._id,
        name: product.nombre,
        imagen: imagenes[currentImg]?.url, // 👈 Esta es la imagen que el usuario seleccionó
        price: product.precio,
        tallas,
      })
    )

    toast.success('Producto añadido al carrito')
    navigate('/cart')
  }

  const handleZoomOpen = (index) => {
    setZoomImg(index)
    setZoomOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setImagenCliente(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmitReview = async () => {
    try {
      if (!rating || !comentario) {
        toast.error('Por favor califica y escribe un comentario antes de enviar')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Debes iniciar sesión para opinar')
        return
      }

      let imagenUrl = ''
      if (imagenCliente) {
        const upload = await uploadImage(imagenCliente)
        imagenUrl = upload
      }

      await api.post(
        `/products/${product._id}/reviews`,
        { rating, comentario, imagenCliente: imagenUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('✅ Opinión enviada')
      setComentario('')
      setRating(0)
      setImagenCliente(null)
      setPreview(null)

      const { data } = await api.get(`/products/${id}`)

      setProduct(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar opinión')
    }
  }

  const imagenes = Array.isArray(product?.imagen) ? product.imagen : []

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Cargando producto...</Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/"
          startIcon={<ArrowBackIosNewIcon />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Volver al inicio
        </Button>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Box
            component="img"
            src={imagenes[currentImg]?.url}
            alt={product.nombre}
            onClick={() => handleZoomOpen(currentImg)}
            sx={{
              width: '100%',
              borderRadius: 2,
              objectFit: 'contain',
              maxHeight: 400,
              cursor: 'zoom-in',
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {imagenes.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img.url}
                alt={`Miniatura ${idx + 1}`}
                onClick={() => setCurrentImg(idx)}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: idx === currentImg ? '2px solid #1976d2' : '1px solid #ccc',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={5} display="flex" justifyContent="flex-end">
          <Box
            sx={{ width: '100%', maxWidth: 420, p: 2, border: '1px solid #eee', borderRadius: 2 }}
          >
            <Typography variant="h4" fontWeight="bold">
              {product.nombre}
            </Typography>

            <Typography variant="subtitle2" mt={1}>
              Categoría: {product.categoria}
            </Typography>

            <Typography variant="subtitle2" mt={2}>
              Tallas disponibles:
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              {Object.entries(cantidadesPorTalla).map(([talla, cantidad]) => (
                <Box key={talla} display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {talla}
                  </Typography>
                  <Select
                    size="small"
                    value={cantidad}
                    onChange={(e) =>
                      setCantidadesPorTalla({
                        ...cantidadesPorTalla,
                        [talla]: parseInt(e.target.value),
                      })
                    }
                  >
                    {[...Array(11).keys()].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Rating value={product.calificacion || 0} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.numCalificaciones || 0} opiniones) • {product.sold?.toLocaleString() || 0}{' '}
                vendidos
              </Typography>
            </Box>

            <Typography variant="h5" color="green" fontWeight="bold" sx={{ mt: 2 }}>
              ${product.precio.toLocaleString()}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              Envío gratis a todo el país. Llega entre 3 y 5 días.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleAddToCart}
              disabled={!Object.values(cantidadesPorTalla).some((qty) => qty > 0)}
            >
              Agregar al carrito
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6">Descripción</Typography>
            <Typography sx={{ mt: 1 }}>{product.descripcion}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Opiniones */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Opiniones
        </Typography>

        {product.opiniones?.length === 0 && (
          <Typography>Aún no hay opiniones para este producto.</Typography>
        )}

        {product.opiniones?.map((review) => (
          <Box key={review._id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar>{review.nombreCliente.charAt(0)}</Avatar>
              <Typography variant="subtitle2">{review.nombreCliente}</Typography>
            </Box>

            <Rating value={review.rating} readOnly sx={{ mt: 0.5 }} />

            {(review.imagen?.url || review.imagenCliente) && (
              <Box mt={1}>
                <img
                  src={review.imagen?.url || review.imagenCliente}
                  alt="Foto del cliente"
                  style={{ maxWidth: 180, borderRadius: 6 }}
                />
              </Box>
            )}

            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {review.comentario}
            </Typography>

            {userInfo?.isAdmin && (
              <Button
                variant="text"
                color="error"
                size="small"
                sx={{ mt: 1 }}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    await api.delete(`/products/${product._id}/reviews/${review._id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })

                    toast.success('Opinión eliminada')
                    const { data } = await api.get(`/products/${product._id}`)
                    setProduct(data)
                  } catch (err) {
                    toast.error('Error al eliminar opinión')
                  }
                }}
              >
                Eliminar opinión
              </Button>
            )}

            <Divider sx={{ my: 2 }} />
          </Box>
        ))}

        {userInfo && puedeOpinar && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Deja tu opinión</Typography>
            <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} sx={{ mt: 1 }} />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button component="label" variant="outlined" sx={{ mt: 2 }}>
              Subir imagen del producto
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {preview && (
              <Box mt={2}>
                <img src={preview} alt="Preview" style={{ maxHeight: 150, borderRadius: 4 }} />
              </Box>
            )}
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSubmitReview}
              disabled={!rating || !comentario}
            >
              Enviar opinión
            </Button>
          </Box>
        )}
      </Box>

      {/* Modal Zoom */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          <img
            src={imagenes[zoomImg]?.url}
            alt="Zoom"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 8,
              boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            }}
          />
          <IconButton
            onClick={() => setZoomImg((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1))}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 20,
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton
            onClick={() => setZoomImg((prev) => (prev + 1) % imagenes.length)}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 20,
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Modal>
    </Container>
  )
}

export default ProductPage
