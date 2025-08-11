import mongoose from 'mongoose'
import logger from '../utils/logger.js' // 👈 importamos el logger

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    logger.info('✅ MongoDB conectado')
  } catch (error) {
    logger.error('❌ Error al conectar con MongoDB', {
      message: error.message,
      uri: process.env.MONGO_URI || 'No definida',
      stack: error.stack,
    })

    // 🛑 Finaliza el proceso si la conexión falla en arranque
    process.exit(1)
  }
}

// import mongoose from 'mongoose'

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI)
//     console.log('✅ MongoDB conectado')
//   } catch (error) {
//     console.error('❌ Error al conectar con MongoDB:')
//     console.error(`🔎 Mensaje: ${error.message}`)
//     console.error(`🧩 URI: ${process.env.MONGO_URI || 'No definida'}`)
//     console.error(error)

//     // 🛑 Finaliza el proceso si la conexión falla en arranque
//     process.exit(1)
//   }
// }
