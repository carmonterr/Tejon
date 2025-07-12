// routes/adminRoutes.js
import express from 'express'
import { protect, isAdmin } from '../middleware/authMiddleware.js'
import {
  getUserCount,
  getOrderStats,
  getProductStats,
  getOrderSummary,
  getVentasPorFecha,
} from '../controllers/adminController.js'

const router = express.Router()

// Rutas administrativas
router.get('/users/count', protect, isAdmin, getUserCount)
router.get('/orders/summary', protect, isAdmin, getOrderSummary)
router.get('/orders/summary', protect, isAdmin, getOrderStats)
router.get('/products/summary', protect, isAdmin, getProductStats)
router.get('/ventas/por-fecha', protect, isAdmin, getVentasPorFecha)

export default router
