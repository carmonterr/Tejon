import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // 🔧 Aseguramos que el campo sea detectado
      message: err.msg,
    }))

    throw new ApiError('Error de validación', 400, 'VALIDATION_ERROR', formattedErrors)
  }

  next()
}

export default validateRequest
