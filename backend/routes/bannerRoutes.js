import express from 'express'
import {
  createBanner,
  getBanners,
  deleteBanner,
  updateBanner,
} from '../controllers/bannerController.js'
import { protect, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// 🔄 Obtener todos los banners (carrusel público)
router.get('/', getBanners)

// ✅ Crear nuevo banner (el frontend ya subió la imagen)
router.post('/', protect, isAdmin, createBanner)

router.put('/:id', protect, isAdmin, updateBanner)

// 🗑️ Eliminar un banner por ID
router.delete('/:id', protect, isAdmin, deleteBanner)

export default router
