// middleware/errorHandler.js

// ✅ Middleware global de manejo de errores
// eslint-disable-next-line no-unused-vars
/* eslint-disable-next-line no-unused-vars */
import logger from '../utils/logger.js'

/* eslint-disable-next-line no-unused-vars */
export const errorHandler = (err, req, res, next) => {
  // 🔹 Log en archivo y consola
  logger.error('❌ Error capturado', {
    message: err.message,
    code: err.code || 'SERVER_ERROR',
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  })

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)

  res.status(statusCode).json({
    message: err.message || 'Error del servidor',
    code: err.code || 'SERVER_ERROR',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}
