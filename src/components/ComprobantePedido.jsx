import React, { useRef, useState } from 'react'
import {
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  Avatar,
  Paper,
  Button,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { toast } from 'react-toastify'
import PropTypes from 'prop-types'

// 🎨 Tema PDF
const staticPDFTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
  },
})

// ✅ Función para formatear moneda colombiana
const formatearMoneda = (numero) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(numero)

const ComprobantePedido = ({ pedido, user }) => {
  const ref = useRef()
  const [ocultarBoton, setOcultarBoton] = useState(false)

  const subtotal = pedido.totalPrice - pedido.shippingPrice
  const totalUnidades = pedido.orderItems.reduce((acc, item) => acc + item.qty, 0)

  const handleDescargarPDF = async () => {
    setOcultarBoton(true)
    await new Promise((r) => setTimeout(r, 100))

    const element = ref.current

    const originalCanvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const imgProps = {
      width: originalCanvas.width,
      height: originalCanvas.height,
    }

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const pdfContentWidth = pageWidth - margin * 2
    const ratio = pdfContentWidth / imgProps.width
    const scaledHeight = imgProps.height * ratio

    const totalPages = Math.ceil(scaledHeight / (pageHeight - 20))
    const sliceHeight = (originalCanvas.height / scaledHeight) * (pageHeight - 20)

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()

      const sliceCanvas = document.createElement('canvas')
      const sliceContext = sliceCanvas.getContext('2d')

      sliceCanvas.width = originalCanvas.width
      sliceCanvas.height = sliceHeight

      sliceContext.drawImage(
        originalCanvas,
        0,
        i * sliceHeight,
        originalCanvas.width,
        sliceHeight,
        0,
        0,
        originalCanvas.width,
        sliceHeight
      )

      const imgData = sliceCanvas.toDataURL('image/png')
      const imgHeightInPDF = (sliceCanvas.height * pdfContentWidth) / sliceCanvas.width

      if (i === 0) {
        const logo = new Image()
        logo.src = import.meta.env.BASE_URL + 'logo.png'
        await new Promise((res) => {
          logo.onload = res
          logo.onerror = () => {
            toast.error('❌ Error al cargar el logo desde /public/logo.png')
            res()
          }
        })
        pdf.addImage(logo, 'PNG', margin, 10, 15, 15)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Comprobante de Pedido', pageWidth - margin, 18, { align: 'right' })

        pdf.setLineWidth(0.2)
        pdf.line(margin, 25, pageWidth - margin, 25)

        pdf.addImage(imgData, 'PNG', margin, 30, pdfContentWidth, imgHeightInPDF)
      } else {
        pdf.addImage(imgData, 'PNG', margin, 10, pdfContentWidth, imgHeightInPDF)
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(150)
      pdf.text(`Página ${i + 1} de ${totalPages}`, pageWidth - margin, pageHeight - 5, {
        align: 'right',
      })

      if (i === totalPages - 1) {
        pdf.text(`Generado el ${new Date().toLocaleDateString()}`, margin, pageHeight - 5)
      }
    }

    pdf.save(`pedido_${pedido._id.slice(-6)}.pdf`)
    toast.success('📄 PDF generado correctamente')
    setOcultarBoton(false)
  }

  return (
    <>
      <ThemeProvider theme={staticPDFTheme}>
        <Box
          ref={ref}
          sx={{
            p: 2,
            maxWidth: '800px',
            mx: 'auto',
            mt: 1,
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1,
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Encabezado */}
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Pedido #{pedido._id.slice(-6)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
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
            <Typography sx={{ fontSize: 11 }}>
              Fecha: {new Date(pedido.createdAt).toLocaleDateString('es-ES')}
            </Typography>
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

          {/* Productos agrupados */}
          <Grid container spacing={1}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Productos:
              </Typography>

              {Object.values(
                pedido.orderItems.reduce((acc, item) => {
                  const key = `${item.name}-${item.image}-${item.price}`
                  if (!acc[key]) {
                    acc[key] = {
                      name: item.name,
                      image: item.image,
                      price: item.price,
                      tallas: [],
                    }
                  }
                  acc[key].tallas.push({
                    talla: item.talla,
                    qty: item.qty,
                    subtotal: item.qty * item.price,
                  })
                  return acc
                }, {})
              )
                .map((producto) => {
                  const total = producto.tallas.reduce((acc, t) => acc + t.subtotal, 0)
                  return { ...producto, total }
                })
                .sort((a, b) => b.total - a.total)
                .map((producto, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2,
                      p: 1.5,
                      backgroundColor: '#e3f2fd',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      src={producto.image}
                      alt={producto.name}
                      variant="rounded"
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box>
                      <Typography fontWeight="bold">{producto.name}</Typography>
                      <Typography fontSize={12} fontWeight="medium">
                        Tallas:
                      </Typography>
                      {producto.tallas.map((t, i) => (
                        <Typography key={i} fontSize={12}>
                          - {t.talla}: {t.qty}
                        </Typography>
                      ))}
                      <Typography fontSize={12}>
                        Precio unitario: {formatearMoneda(producto.price)}
                      </Typography>
                      <Typography fontSize={12} fontWeight="bold">
                        Subtotal: {formatearMoneda(producto.total)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </Grid>

            {/* Resumen */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  border: '1px solid #ddd',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Resumen
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography>Total Unidades: {totalUnidades}</Typography>
                <Typography>Subtotal: {formatearMoneda(subtotal)}</Typography>
                <Typography>Envío: {formatearMoneda(pedido.shippingPrice)}</Typography>
                <Typography fontWeight="bold" color="primary">
                  Total: {formatearMoneda(pedido.totalPrice)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </ThemeProvider>

      {!ocultarBoton && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={handleDescargarPDF} color="primary">
            Descargar comprobante en PDF
          </Button>
        </Box>
      )}
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
