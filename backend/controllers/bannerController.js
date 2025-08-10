import mongoose from 'mongoose'
import asyncHandler from '../utils/asyncHandler.js'
import Banner from '../models/Banner.js'
import { v2 as cloudinary } from 'cloudinary'

// ✅ Crear un nuevo banner
export const createBanner = asyncHandler(async (req, res) => {
  const { title, description, link, image, order, align } = req.body

  if (!image?.url || !image?.public_id) {
    res.status(400)
    throw new Error('La imagen del banner es obligatoria')
  }

  const banner = await Banner.create({
    title,
    description,
    link,
    order,
    align,
    image,
  })

  res.status(201).json(banner)
})

// 🔄 Obtener todos los banners (público)
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 })
  res.json(banners)
})

// ✏️ Actualizar un banner
export const updateBanner = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('ID de banner inválido')
  }

  const banner = await Banner.findById(req.params.id)
  if (!banner) {
    res.status(404)
    throw new Error('Banner no encontrado')
  }

  const { title, description, link, image, order, align } = req.body

  banner.title = title || banner.title
  banner.description = description || banner.description
  banner.link = link || banner.link
  banner.order = order ?? banner.order
  banner.align = align || banner.align

  // ✅ Si llega nueva imagen, actualizamos y borramos la anterior
  if (image?.public_id && image?.url && image.public_id !== banner.image.public_id) {
    try {
      await cloudinary.uploader.destroy(banner.image.public_id)
    } catch (err) {
      console.error('Error borrando imagen anterior en Cloudinary:', err.message)
    }
    banner.image = image
  }

  const updated = await banner.save()
  res.json(updated)
})

// 🗑️ Eliminar un banner y su imagen
export const deleteBanner = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('ID de banner inválido')
  }

  const banner = await Banner.findById(req.params.id)
  if (!banner) {
    res.status(404)
    throw new Error('Banner no encontrado')
  }

  if (banner.image?.public_id) {
    try {
      await cloudinary.uploader.destroy(banner.image.public_id)
    } catch (err) {
      console.error('Error borrando imagen en Cloudinary:', err.message)
    }
  }

  await Banner.findByIdAndDelete(banner._id)
  res.json({ message: 'Banner eliminado correctamente' })
})
