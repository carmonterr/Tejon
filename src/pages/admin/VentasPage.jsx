import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Grid,
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js'
import API from '../../api/axios'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTooltip,
  Legend,
  Filler
)

const VentasPage = () => {
  const [ventasData, setVentasData] = useState([])
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d
  })
  const [toDate, setToDate] = useState(new Date())
  const [agrupadoPor, setAgrupadoPor] = useState('dia')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const chartRef = useRef(null)

  const fetchVentasPorFecha = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get('/admin/ventas/por-fecha', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          from: fromDate?.toLocaleDateString('en-CA') || '',
          to: toDate?.toLocaleDateString('en-CA') || '',
          tipo: agrupadoPor,
        },
      })
      setVentasData(res.data)
    } catch (error) {
      console.error('⛔ Error al obtener datos de ventas:', error)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, agrupadoPor, token])

  useEffect(() => {
    fetchVentasPorFecha()
  }, [fetchVentasPorFecha])

  const chartData = {
    labels: ventasData.map((v) => v.fecha),
    datasets: [
      {
        label: 'Ventas',
        data: ventasData.map((v) => v.totalVentas),
        borderColor: '#3f51b5',
        backgroundColor: (context) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(63, 81, 181, 0.4)')
          gradient.addColorStop(1, 'rgba(63, 81, 181, 0.05)')
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const exportToCSV = () => {
    const header = 'Fecha,Total Ventas\n'
    const rows = ventasData.map((v) => `${v.fecha},${v.totalVentas}`).join('\n')
    const csvContent = header + rows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute(
      'download',
      `ventas-${fromDate.toISOString().split('T')[0]}_a_${toDate.toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📈 Análisis de Ventas
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Hasta"
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="agrupar-por-label">Agrupar por</InputLabel>
              <Select
                labelId="agrupar-por-label"
                value={agrupadoPor}
                label="Agrupar por"
                onChange={(e) => setAgrupadoPor(e.target.value)}
              >
                <MenuItem value="dia">Día</MenuItem>
                <MenuItem value="mes">Mes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              sx={{ height: '100%' }}
              onClick={exportToCSV}
            >
              Exportar CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              📊 Gráfica de ventas
            </Typography>
            <Line ref={chartRef} data={chartData} />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              📋 Tabla resumen de ventas
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Total Ventas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventasData.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>{v.fecha}</TableCell>
                    <TableCell>${v.totalVentas.toLocaleString('es-CO')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default VentasPage
