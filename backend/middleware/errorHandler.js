// middleware/errorHandler.js

// ✅ Middleware global de manejo de errores
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error capturado:', err)

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)

  res.status(statusCode).json({
    message: err.message || 'Error del servidor',
    code: err.code || 'SERVER_ERROR',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}
