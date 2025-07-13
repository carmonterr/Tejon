import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB conectado')
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:')
    console.error(`🔎 Mensaje: ${error.message}`)
    console.error(`🧩 URI: ${process.env.MONGO_URI || 'No definida'}`)
    console.error(error)

    // 🛑 Finaliza el proceso si la conexión falla en arranque
    process.exit(1)
  }
}
