import express from 'express'
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  deleteProductReview,
  canUserReviewProduct,
} from '../controllers/productController.js'

import { protect, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Productos públicos
router.get('/', getAllProducts)
router.get('/:id', getProductById)

// Revisar si puede opinar
router.get('/:id/can-review', protect, canUserReviewProduct)

// Opiniones
router.post('/:id/reviews', protect, addProductReview) // Solo una versión
router.delete('/:productId/reviews/:reviewId', protect, isAdmin, deleteProductReview)

// Admin - gestión productos
router.post('/', protect, isAdmin, createProduct)
router.put('/:id', protect, isAdmin, updateProduct)
router.delete('/:id', protect, isAdmin, deleteProduct)

export default router
