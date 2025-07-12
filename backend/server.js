import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { scheduleUserCleanup } from './cron/cleanUnverifiedUsers.js'
import bannerRoutes from './routes/bannerRoutes.js'

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)

app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
//app.use('/api/admin', getOrderSummary)
//.use('/api/admin', getVentasPorFecha)

app.use('/api/banners', bannerRoutes)

app.use(errorHandler)
scheduleUserCleanup()

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT}`)
})
