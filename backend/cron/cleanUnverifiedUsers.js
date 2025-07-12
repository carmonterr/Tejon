import cron from 'node-cron'
import User from '../models/userModel.js'

// Obtener frecuencia desde .env o usar una por defecto
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 3 * * *'

export const scheduleUserCleanup = () => {
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`🕐 Ejecutando limpieza con frecuencia: "${CRON_SCHEDULE}"`)

    try {
      const expired = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const now = new Date()

      const result = await User.deleteMany({
        isVerified: false,
        $or: [{ createdAt: { $lt: expired } }, { verificationCodeExpires: { $lt: now } }],
      })

      if (result.deletedCount > 0) {
        console.log(`🧹 ${result.deletedCount} usuarios no verificados eliminados.`)
      } else {
        console.log('🧼 No se encontraron usuarios para eliminar.')
      }
    } catch (error) {
      console.error('⛔ Error en limpieza automática:', error.message)
    }
  })
}
