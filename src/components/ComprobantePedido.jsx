import React, { useRef } from 'react'
import { Typography, Box, Divider, Chip, Grid, Avatar, Paper, Button } from '@mui/material'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { toast } from 'react-toastify'
import PropTypes from 'prop-types'

const ComprobantePedido = ({ pedido, user }) => {
  const subtotal = pedido.totalPrice - pedido.shippingPrice
  const totalUnidades = pedido.orderItems.reduce((acc, item) => acc + item.qty, 0)
  const ref = useRef()

  const handleDescargarPDF = async () => {
    const element = ref.current
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()

    const logo = new Image()
    logo.src = '/prueba.jpg'

    logo.onload = () => {
      const centerX = pageWidth / 2
      pdf.addImage(logo, 'jpg', 15, 10, 20, 20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Tienda MERN', centerX, 20, { align: 'center' })

      pdf.setFontSize(12)
      pdf.text('Comprobante de Pedido', centerX, 28, { align: 'center' })

      pdf.setLineWidth(0.2)
      pdf.line(10, 32, pageWidth - 10, 32)

      pdf.addImage(imgData, 'jpg', 10, 35, pageWidth - 20, 0)

      pdf.setFontSize(10)
      pdf.setTextColor(150)
      pdf.text(`Generado el ${new Date().toLocaleDateString()}`, 10, 290)

      pdf.save(`pedido_${pedido._id.slice(-6)}.pdf`)
      toast.success('📄 PDF generado correctamente')
    }
  }

  return (
    <>
      <Box ref={ref} sx={{ p: 4, maxWidth: '800px', mx: 'auto', backgroundColor: '#fff' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            src="https://cdn-icons-png.flaticon.com/512/10793/10793764.png"
            sx={{ width: 72, height: 72, mx: 'auto', mb: 1 }}
          />
          <Typography variant="h5" fontWeight="bold">
            Tienda MERN
          </Typography>
          <Typography variant="subtitle2">Comprobante de Pedido</Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pedido #{pedido._id.slice(-6)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={pedido.isPaid ? 'Pagado' : 'No pagado'}
                color={pedido.isPaid ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={pedido.isDelivered ? 'Entregado' : 'No entregado'}
                color={pedido.isDelivered ? 'primary' : 'default'}
                size="small"
              />
            </Box>
            {pedido.isDelivered && pedido.deliveredAt && (
              <Typography sx={{ color: 'gray', fontSize: 13 }}>
                Entregado el:{' '}
                {new Date(pedido.deliveredAt).toLocaleString('es-ES', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Datos del Cliente:
          </Typography>
          <Typography>
            <strong>Nombre:</strong> {user.name}
          </Typography>
          <Typography>
            <strong>Correo:</strong> {user.email}
          </Typography>
          <Typography>
            <strong>Teléfono:</strong> {user.phone || 'No disponible'}
          </Typography>
          <Typography>
            <strong>Dirección:</strong> {user.address || 'No proporcionada'}
          </Typography>
        </Box>

        <Grid container columns={12} spacing={3}>
          <Grid item columnSpan={{ xs: 12, md: 8 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Productos:
            </Typography>
            {Object.values(
              pedido.orderItems.reduce((acc, item) => {
                const key = `${item.name}-${item.image}`
                if (!acc[key]) {
                  acc[key] = { name: item.name, image: item.image, price: item.price, tallas: [] }
                }
                acc[key].tallas.push({
                  talla: item.talla !== undefined ? item.talla : 'No especificada',
                  qty: item.qty,
                  subtotal: item.qty * item.price,
                })
                return acc
              }, {})
            ).map((producto, idx) => (
              <React.Fragment key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={producto.image}
                    alt={producto.name}
                    variant="rounded"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography fontWeight="bold">{producto.name}</Typography>
                    {producto.tallas.map((tallaItem, tallaIdx) => (
                      <Typography key={tallaIdx}>
                        Talla: {tallaItem.talla}, Cantidad: {tallaItem.qty}, Subtotal: $
                        {tallaItem.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Typography>
                    ))}
                    <Typography>Precio unitario: ${producto.price.toLocaleString()}</Typography>
                    <Typography fontWeight="bold">
                      Subtotal:{' '}
                      {producto.tallas
                        .reduce((sum, talla) => sum + talla.subtotal, 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
                {idx < pedido.orderItems.length - 1 && <Divider sx={{ mb: 2 }} />}
              </React.Fragment>
            ))}
          </Grid>

          <Grid item columnSpan={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography>Total de Unidades: {totalUnidades}</Typography>
              <Typography>
                Subtotal: ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
              <Typography>Envío: ${pedido.shippingPrice?.toFixed(2) || '0.00'}</Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                Total: ${pedido.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" onClick={handleDescargarPDF} color="primary">
          Descargar comprobante en PDF
        </Button>
      </Box>
    </>
  )
}

ComprobantePedido.propTypes = {
  pedido: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    shippingPrice: PropTypes.number.isRequired,
    isPaid: PropTypes.bool,
    isDelivered: PropTypes.bool,
    deliveredAt: PropTypes.string,
    orderItems: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        price: PropTypes.number.isRequired,
        qty: PropTypes.number.isRequired,
        talla: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ).isRequired,
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
}

export default ComprobantePedido
