import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Middleware para proteger rutas: requiere token válido
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1]

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Buscar al usuario y anexarlo a la solicitud
      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('⛔ Error de autenticación:', error)
      return res.status(401).json({ message: 'Token no válido' })
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, token faltante' })
  }
}

// Middleware para permitir solo a administradores
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    return res.status(403).json({ message: 'Acceso denegado. No eres administrador.' })
  }
}
