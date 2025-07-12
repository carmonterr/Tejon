class ApiError extends Error {
  constructor(message, statusCode, code = null, errors = null) {
    super(message)
    this.statusCode = statusCode // Ej: 400, 401, 404...
    this.code = code // Ej: 'VALIDATION_ERROR', 'EMAIL_IN_USE'
    this.errors = errors // Array de errores específicos (opcional)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
