import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PropTypes from 'prop-types'

const ModalPedido = ({ open, onClose, carrito, onConfirm }) => {
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const envio = 9.99
  const total = subtotal + envio

  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleOutlineIcon color="primary" /> Confirmar Pedido
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Estás a punto de confirmar tu pedido. Por favor verifica los detalles:
        </Typography>

        <List>
          {carrito.map((item, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemText
                primary={`${item.nombre} (Talla: ${item.talla || 'No especificada'}) x ${item.cantidad}`}
                secondary={`Precio unitario: $${item.precio.toLocaleString()} - Subtotal: $${(
                  item.precio * item.cantidad
                ).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">
          Total unidades: <strong>{totalUnidades}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Subtotal: <strong>${subtotal.toLocaleString()}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Envío: <strong>${envio}</strong>
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1.5 }}>
          Total: ${total.toLocaleString()}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          sx={{ textTransform: 'none' }}
        >
          Confirmar Pedido
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ModalPedido.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  carrito: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string.isRequired,
      talla: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      precio: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ).isRequired,
}

export default ModalPedido
