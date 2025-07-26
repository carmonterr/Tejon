import { Card, CardContent, Typography, Rating, Box, Chip, CardActionArea } from '@mui/material'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const ProductCard = ({ product }) => {
  const getImageUrl = () =>
    Array.isArray(product.imagen) && product.imagen.length > 0
      ? typeof product.imagen[0] === 'string'
        ? product.imagen[0]
        : product.imagen[0]?.url
      : 'https://dummyimage.com/300x300/cccccc/000000&text=Sin+imagen'

  const isLowStock = product.inventario > 0 && product.inventario <= 5
  const isOutOfStock = product.inventario === 0

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 360,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.015)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/product/${product._id}`}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Imagen */}
        <Box
          component="img"
          src={getImageUrl()}
          alt={`Imagen del producto ${product.nombre}`}
          sx={{
            height: { xs: 160, sm: 200, md: 240 },
            width: '100%',
            objectFit: 'cover',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />

        {/* Contenido */}
        <CardContent
          sx={{
            flexGrow: 1,
            px: 2,
            py: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              component="div"
              fontWeight={600}
              noWrap
              title={product.nombre}
            >
              {product.nombre || 'Sin nombre'}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.2 }}>
              ${!isNaN(product.precio) ? Number(product.precio).toLocaleString('es-CO') : '0'}
            </Typography>

            <Box mt={0.5} display="flex" alignItems="center" gap={0.5}>
              <Rating value={product.calificacion || 0} precision={0.5} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({product.numCalificaciones || 0})
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
              {product.sold > 0 ? `${product.sold}+ vendidos` : 'Sin ventas aún'}
            </Typography>
          </Box>

          {/* Estado de stock */}
          {isOutOfStock ? (
            <Chip label="Agotado" color="error" size="small" sx={{ mt: 0.5 }} />
          ) : isLowStock ? (
            <Chip label="¡Bajo stock!" color="warning" size="small" sx={{ mt: 0.5 }} />
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    imagen: PropTypes.arrayOf(
      PropTypes.shape({
        public_id: PropTypes.string,
        url: PropTypes.string.isRequired,
      })
    ),
    precio: PropTypes.number.isRequired,
    calificacion: PropTypes.number,
    numCalificaciones: PropTypes.number,
    inventario: PropTypes.number.isRequired,
    sold: PropTypes.number,
  }).isRequired,
}

export default ProductCard
