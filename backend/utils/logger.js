import { createLogger, format, transports } from 'winston'

const isDev = process.env.NODE_ENV !== 'production'

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    isDev
      ? format.colorize({ all: true }) // 🎨 Colores en desarrollo
      : format.uncolorize(), // ❌ Sin colores en producción
    isDev
      ? format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let log = `[${timestamp}] ${level}: ${message}`
          if (stack) log += `\nStack: ${stack}`
          if (Object.keys(meta).length) log += `\nMeta: ${JSON.stringify(meta, null, 2)}`
          return log
        })
      : format.json() // 📦 JSON en producción
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

export default logger
