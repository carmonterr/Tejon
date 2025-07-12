import {
  Card,
  CardContent,
  Typography,
  Button,
  Rating,
  CardActions,
  Box,
  Chip,
} from '@mui/material'
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
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 6,
        },
      }}
    >
      {/* Imagen contenida y alineada arriba */}
      <Box
        sx={{
          height: 200,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // alinea arriba
          overflow: 'hidden',
          p: 1,
        }}
      >
        <Box
          component="img"
          src={getImageUrl()}
          alt={`Imagen del producto ${product.nombre}`}
          sx={{
            objectFit: 'contain',
            maxHeight: '100%',
            width: '100%',
          }}
        />
      </Box>

      {/* Contenido */}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap title={product.nombre}>
          {product.nombre || 'Sin nombre'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          ${!isNaN(product.precio) ? Number(product.precio).toLocaleString('es-CO') : '0'}
        </Typography>

        <Box mt={1} display="flex" alignItems="center" gap={1}>
          <Rating value={product.calificacion || 0} precision={0.5} readOnly />
          <Typography variant="caption" color="text.secondary">
            ({product.numCalificaciones || 0})
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {product.sold > 0 ? `${product.sold}+ vendidos` : 'Sin ventas aún'}
        </Typography>

        {/* Indicador de stock */}
        {isOutOfStock ? (
          <Chip label="Agotado" color="error" size="small" sx={{ mt: 1 }} />
        ) : isLowStock ? (
          <Chip label="¡Bajo stock!" color="warning" size="small" sx={{ mt: 1 }} />
        ) : null}
      </CardContent>

      {/* Botón */}
      <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }} disableSpacing>
        <Button size="small" variant="outlined" component={Link} to={`/product/${product._id}`}>
          Ver más
        </Button>
      </CardActions>
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
