import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import ApiError from '../utils/ApiError.js'

// 🔐 Middleware para proteger rutas
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return next(new ApiError('⚠️ Usuario no encontrado', 401, 'USER_NOT_FOUND'))
      }

      req.user = user
      next()
    } catch (error) {
      console.error('⛔ Error de autenticación:', error)
      return next(new ApiError('❌ Token no válido o expirado', 401, 'INVALID_TOKEN'))
    }
  } else {
    return next(new ApiError('🔒 No autorizado. Token no proporcionado.', 401, 'NO_TOKEN'))
  }
}

// 🛡️ Middleware para validar si es administrador
export const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next()
  } else {
    return next(
      new ApiError('🚫 Acceso denegado. Requiere rol de administrador.', 403, 'NOT_ADMIN')
    )
  }
}
