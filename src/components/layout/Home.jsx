import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Pagination,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Skeleton,
  Divider,
} from '@mui/material'
import ProductCard from '../../components/ProductCard'
import { fetchProducts } from '../../redux/slices/productSlice'
import { useSearchParams } from 'react-router-dom'
import BannerCarousel from '../BannerCarousel'

const Home = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  // Leer query params
  const search = searchParams.get('search') || ''
  const categoria = searchParams.get('categoria') || ''
  const sort = searchParams.get('sort') || 'newest'
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)

  // Redux
  const { products = [], pages = 1, loading = false } = useSelector((state) => state.product) || {}

  useEffect(() => {
    document.title = 'Inicio | Tienda MERN'
    dispatch(fetchProducts({ search, categoria, sort, page: pageFromUrl, limit: 4 }))
  }, [dispatch, search, categoria, sort, pageFromUrl])

  const handleChangePage = (event, newPage) => {
    setSearchParams({ search, categoria, sort, page: newPage })
  }

  return (
    <Container sx={{ mt: 4 }}>
      {/* Carrusel */}
      <BannerCarousel />

      {/* Título y Filtros */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mt={4}
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Productos Destacados
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoria}
              label="Categoría"
              onChange={(e) =>
                setSearchParams({ search, categoria: e.target.value, sort, page: 1 })
              }
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
              value={sort}
              label="Ordenar por"
              onChange={(e) =>
                setSearchParams({ search, categoria, sort: e.target.value, page: 1 })
              }
            >
              <MenuItem value="newest">Más nuevos</MenuItem>
              <MenuItem value="bestseller">Más vendidos</MenuItem>
              <MenuItem value="price-asc">Precio ascendente</MenuItem>
              <MenuItem value="price-desc">Precio descendente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Productos */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Typography variant="body1">No se encontraron productos.</Typography>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 4,
            }}
          >
            {products.map((product) => (
              <Box key={product._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>

          {pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pages}
                page={pageFromUrl}
                onChange={(e, value) => handleChangePage(e, value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default Home
