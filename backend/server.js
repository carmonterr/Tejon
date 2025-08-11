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
import cloudinaryRoutes from './routes/cloudinaryRoutes.js'
import logger from './utils/logger.js'

connectDB()

const app = express()

//deven de estar antes de usar process.env el dotenv.config()
//para que cargue las variables de entorno antes de usarlas
dotenv.config()
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    //credentials: false, // ✅ porque NO estás usando cookies
  })
)

app.use(express.json())

// Aquí puedes hacer pruebas de logging

app.use('/api/cloudinary', cloudinaryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)

app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

//app.use('/api/admin', getOrderSummary)
//.use('/api/admin', getVentasPorFecha)

app.use('/api/banners', bannerRoutes)

app.use(errorHandler)

if (process.env.NODE_ENV === 'production') {
  scheduleUserCleanup()
}

const PORT = process.env.PORT || 5000

app.listen(process.env.PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`)
})
