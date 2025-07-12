// routes/userRoutes.js
import express from 'express'
import {
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  deleteUser,
  updateUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js'
import { protect, isAdmin } from '../middleware/authMiddleware.js'
import { registerValidation } from '../validators/authValidators.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

// rutas públicas
router.post('/verify-email', verifyEmail) // ✅ Nueva ruta
router.post('/register', registerValidation, validateRequest, registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

// rutas privadas
router.get('/profile', protect, getProfile)

// rutas de administración
router.get('/', protect, isAdmin, getUsers)
router.delete('/:id', protect, isAdmin, deleteUser)
router.put('/:id', protect, isAdmin, updateUser)

export default router
