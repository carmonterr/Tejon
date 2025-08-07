import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../api/axios'
import { uploadToCloudinary } from '../utils/cloudinaryUpload' // ✅ NUEVO

const BannersPage = () => {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
    order: 0,
    align: 'left',
  })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const fileInputRef = useRef(null)

  const token = localStorage.getItem('token') // ✅ TOKEN desde el login

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await API.get('api/banners')
      const sorted = res.data.sort((a, b) => a.order - b.order)
      setBanners(sorted)
    } catch (err) {
      toast.error('Error al cargar los banners')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      link: '',
      order: 0,
      align: 'left',
    })
    setFile(null)
    setPreviewUrl(null)
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!editingId && !file) {
      toast.warning('Selecciona una imagen')
      return
    }

    try {
      setLoading(true)
      let imageData = null

      if (file) {
        // ✅ Subida segura a Cloudinary
        imageData = await uploadToCloudinary(file, token)
      }

      const payload = {
        ...form,
        ...(imageData && { image: imageData }),
      }

      if (editingId) {
        await API.put(`api/banners/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('✅ Banner actualizado')
      } else {
        await API.post(
          'api/banners',
          { ...payload, image: imageData },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        toast.success('✅ Banner creado')
      }

      resetForm()
      fetchBanners()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Error al guardar el banner')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner) => {
    setEditingId(banner._id)
    setForm({
      title: banner.title || '',
      description: banner.description || '',
      link: banner.link || '',
      order: banner.order || 0,
      align: banner.align || 'left',
    })
    setPreviewUrl(banner.image?.url || null)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este banner?')) return
    try {
      await API.delete(`api/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('🗑 Banner eliminado')
      fetchBanners()
    } catch (err) {
      toast.error('Error al eliminar el banner')
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Banners
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Editar banner' : 'Crear nuevo banner'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Título (opcional)"
              name="title"
              fullWidth
              value={form.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Link (opcional)"
              name="link"
              fullWidth
              value={form.link}
              onChange={handleChange}
              placeholder="/ofertas"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción (opcional)"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Orden"
              name="order"
              type="number"
              fullWidth
              value={form.order}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              select
              label="Alineación"
              name="align"
              fullWidth
              value={form.align}
              onChange={handleChange}
              SelectProps={{ native: true }}
            >
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button component="label" variant="outlined" fullWidth>
              {file ? 'Imagen seleccionada' : 'Subir imagen'}
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const selectedFile = e.target.files[0]
                  setFile(selectedFile)
                  if (selectedFile) setPreviewUrl(URL.createObjectURL(selectedFile))
                }}
              />
            </Button>
          </Grid>

          {previewUrl && (
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  width: '100%',
                  maxWidth: 600,
                  aspectRatio: '16 / 6',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <CircularProgress size={24} />
              ) : editingId ? (
                'Guardar Cambios'
              ) : (
                'Guardar Banner'
              )}
            </Button>
          </Grid>

          {editingId && (
            <Grid item xs={12}>
              <Button variant="text" color="secondary" fullWidth onClick={resetForm}>
                Cancelar edición
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {Array.isArray(banners) && banners.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No hay banners registrados.
          </Typography>
        ) : (
          <List>
            {banners.map((banner) => (
              <ListItem key={banner._id} divider>
                <ListItemText
                  primary={banner.title || 'Sin título'}
                  secondary={
                    <>
                      {`Link: ${banner.link || '/'} | Orden: ${banner.order}`}
                      <Box component="span" sx={{ display: 'inline-flex', ml: 1 }}>
                        <Tooltip title="Alineación del contenido">
                          <Chip
                            label={banner.align === 'right' ? 'Derecha' : 'Izquierda'}
                            color={banner.align === 'right' ? 'secondary' : 'primary'}
                            size="small"
                            icon={
                              banner.align === 'right' ? (
                                <ArrowForwardIosIcon fontSize="small" />
                              ) : (
                                <ArrowBackIosNewIcon fontSize="small" />
                              )
                            }
                          />
                        </Tooltip>
                      </Box>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(banner)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleDelete(banner._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}

export default BannersPage
