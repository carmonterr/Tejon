import express from 'express'
import { protect, isAdmin } from '../middleware/authMiddleware.js'
import { generateCloudinarySignature } from '../controllers/cloudinaryController.js'

const router = express.Router()

router.post('/signature', protect, isAdmin, generateCloudinarySignature)

export default router
