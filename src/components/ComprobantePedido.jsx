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

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()

    const logo = new Image()
    logo.src = import.meta.env.BASE_URL + 'logo.png'

    logo.onload = () => {
      // Encabezado centrado en PDF
      const centerX = pageWidth / 2
      pdf.addImage(logo, 'PNG', centerX - 10, 10, 20, 20)

      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Calzado CarMon - Comprobante de Pedido', centerX, 35, { align: 'center' })

      pdf.setLineWidth(0.2)
      pdf.line(10, 40, pageWidth - 10, 40)

      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pageWidth - 20
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, 'PNG', 10, 45, pdfWidth, pdfHeight)

      pdf.setFontSize(9)
      pdf.setTextColor(150)
      pdf.text(`Generado el ${new Date().toLocaleDateString()}`, 10, 290)

      pdf.save(`pedido_${pedido._id.slice(-6)}.pdf`)
      toast.success('📄 PDF generado correctamente')
    }

    logo.onerror = () => {
      toast.error('❌ Error al cargar el logo desde /public/logo.png')
    }
  }

  return (
    <>
      <Box
        ref={ref}
        sx={{
          p: 2,
          maxWidth: '800px',
          mx: 'auto',
          mt: 1,
          backgroundColor: '#fff',
          borderRadius: 1,
          fontSize: 13,
        }}
      >
        {/* ✅ Ya no hay encabezado visual aquí */}

        {/* Info del Pedido */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Pedido #{pedido._id.slice(-6)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            <Typography sx={{ fontSize: 12 }}>
              Fecha: {new Date(pedido.createdAt).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        </Box>

        {/* Cliente */}
        <Box sx={{ mb: 1 }}>
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

        {/* Productos + Resumen */}
        <Grid container spacing={1}>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom>
              Productos:
            </Typography>
            {Object.values(
              pedido.orderItems.reduce((acc, item) => {
                const key = `${item.name}-${item.image}`
                if (!acc[key]) {
                  acc[key] = {
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    tallas: [],
                  }
                }
                acc[key].tallas.push({
                  talla: item.talla ?? 'No especificada',
                  qty: item.qty,
                  subtotal: item.qty * item.price,
                })
                return acc
              }, {})
            ).map((producto, idx) => (
              <React.Fragment key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={producto.image}
                    alt={producto.name}
                    variant="rounded"
                    sx={{ width: 48, height: 48, mr: 1 }}
                  />
                  <Box>
                    <Typography fontWeight="bold">{producto.name}</Typography>
                    {producto.tallas.map((t, i) => (
                      <Typography key={i}>
                        Talla: {t.talla}, Cant: {t.qty}, Subtotal: ${t.subtotal.toFixed(2)}
                      </Typography>
                    ))}
                    <Typography fontSize={12}>Unit: ${producto.price.toFixed(2)}</Typography>
                  </Box>
                </Box>
                {idx < pedido.orderItems.length - 1 && <Divider sx={{ mb: 1 }} />}
              </React.Fragment>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Resumen
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography>Total Unidades: {totalUnidades}</Typography>
              <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
              <Typography>Envío: ${pedido.shippingPrice?.toFixed(2) || '0.00'}</Typography>
              <Typography fontWeight="bold" color="primary">
                Total: ${pedido.totalPrice.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Botón de descarga */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
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
    createdAt: PropTypes.string,
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
