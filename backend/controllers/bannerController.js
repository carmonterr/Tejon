import Banner from '../models/Banner.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import cloudinary from '../utils/cloudinary.js'
import mongoose from 'mongoose'

// ✅ Crear nuevo banner
export const createBanner = asyncHandler(async (req, res) => {
  const { title, description, link, order, image } = req.body

  if (!image || !image.url || !image.public_id) {
    throw new ApiError('La imagen es requerida', 400, 'IMAGE_REQUIRED')
  }

  const banner = await Banner.create({
    title,
    description,
    link,
    order,
    image,
  })

  res.status(201).json({ message: '✅ Banner creado', banner })
})

// ✅ Obtener todos los banners (para el carrusel)
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 })
  res.json(banners)
})

// ✅ Eliminar un banner
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Validar ID de Mongo
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError('ID de banner inválido', 400, 'INVALID_ID')
  }

  const banner = await Banner.findById(id)

  if (!banner) {
    throw new ApiError('Banner no encontrado', 404, 'BANNER_NOT_FOUND')
  }

  // Intentar eliminar imagen de Cloudinary si tiene public_id
  if (banner.image?.public_id) {
    try {
      await cloudinary.v2.uploader.destroy(banner.image.public_id)
    } catch (err) {
      console.error('❌ Error al eliminar imagen de Cloudinary:', err.message)
      // Puedes decidir continuar o lanzar error
      // throw new ApiError('Error al eliminar imagen de Cloudinary', 500)
    }
  }

  await banner.deleteOne()

  res.json({ message: '🗑️ Banner eliminado correctamente' })
})
export const updateBanner = asyncHandler(async (req, res) => {
  const { title, description, link, order, image } = req.body
  const banner = await Banner.findById(req.params.id)

  if (!banner) {
    throw new ApiError('Banner no encontrado', 404, 'BANNER_NOT_FOUND')
  }

  // Actualizar campos
  banner.title = title || banner.title
  banner.description = description || banner.description
  banner.link = link || banner.link
  banner.order = order ?? banner.order

  // Si hay nueva imagen
  if (image?.url && image?.public_id && image.public_id !== banner.image.public_id) {
    // Eliminar anterior de Cloudinary
    if (banner.image?.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id)
    }
    banner.image = image
  }

  const updated = await banner.save()
  res.json({ message: '✅ Banner actualizado', banner: updated })
})
