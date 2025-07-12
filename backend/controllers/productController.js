import Product from '../models/Product.js'
import Order from '../models/Order.js'
import cloudinary from '../utils/cloudinary.js' // ⚠️ Verifica que la ruta sea correcta
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// ✅ Crear producto
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    ...req.body,
    user: req.user._id, // 🧑‍💻 El usuario que lo creó
  })

  const saved = await product.save()

  res.status(201).json(saved)
})
// ✅ Obtener todos los productos

export const getAllProducts = asyncHandler(async (req, res) => {
  const { search = '', categoria = '', sort = 'newest', page = 1, limit = 10 } = req.query

  const pageNumber = parseInt(page, 10) || 1
  const limitNumber = parseInt(limit, 10) || 10
  const skip = (pageNumber - 1) * limitNumber

  const filter = {}
  if (categoria) filter.categoria = categoria
  if (search) filter.nombre = { $regex: search, $options: 'i' }

  let sortQuery = { createdAt: -1 }
  if (sort === 'bestseller') sortQuery = { sold: -1 }
  if (sort === 'price-asc') sortQuery = { precio: 1 }
  if (sort === 'price-desc') sortQuery = { precio: -1 }

  const total = await Product.countDocuments(filter)

  const products = await Product.find(filter).sort(sortQuery).skip(skip).limit(limitNumber)

  res.json({
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    products,
  })
})

// ✅ Obtener un producto por ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  res.json(product)
})

// ✅ Eliminar producto + imágenes principales + imágenes de opiniones
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  // ✅ Eliminar imágenes principales
  for (const img of product.imagen) {
    if (img.public_id) {
      console.log('🗑 Eliminando imagen del producto:', img.public_id)
      await cloudinary.uploader.destroy(img.public_id)
    }
  }

  // ✅ Eliminar imágenes de opiniones
  for (const opinion of product.opiniones) {
    if (opinion.imagen?.public_id) {
      console.log('🗑 Eliminando imagen de opinión:', opinion.imagen.public_id)
      await cloudinary.uploader.destroy(opinion.imagen.public_id)
    }
  }

  await product.deleteOne()

  res.json({ message: '✅ Producto eliminado correctamente' })
})

// ✅ Actualizar producto (sin tocar imágenes aquí)
export const updateProduct = asyncHandler(async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!updated) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  res.json(updated)
})
// ✅ Agregar opinión al producto

// ✅ Añadir reseña al producto
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comentario, imagenCliente: imagen } = req.body

  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  // ✅ Verificar si ya dejó reseña
  const alreadyReviewed = product.opiniones.find(
    (op) => op.user && op.user.toString() === req.user._id.toString()
  )

  if (alreadyReviewed) {
    throw new ApiError('⚠️ Ya has dejado una opinión para este producto.', 400, 'ALREADY_REVIEWED')
  }

  // ✅ Verificar si lo compró
  const hasPurchased = await Order.exists({
    user: req.user._id,
    'orderItems.product': req.params.id,
    isPaid: true,
  })

  if (!hasPurchased) {
    throw new ApiError(
      '⛔ Debes haber comprado este producto para dejar una opinión.',
      403,
      'NOT_ELIGIBLE_TO_REVIEW'
    )
  }

  // ✅ Crear nueva opinión
  const nuevaOpinion = {
    nombreCliente: req.user.name,
    rating: Number(rating),
    comentario,
    user: req.user._id,
  }

  if (imagen && imagen.url && imagen.public_id) {
    nuevaOpinion.imagen = {
      url: imagen.url,
      public_id: imagen.public_id,
    }
  }

  product.opiniones.push(nuevaOpinion)

  product.numCalificaciones = product.opiniones.length

  product.calificacion =
    product.opiniones.reduce((acc, op) => acc + op.rating, 0) / product.opiniones.length

  await product.save()

  res.status(201).json({ message: '✅ Opinión añadida correctamente' })
})

// ✅ Eliminar opinión + imagen de Cloudinary
export const deleteProductReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params

  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  const review = product.opiniones.id(reviewId)
  if (!review) {
    throw new ApiError('❌ Opinión no encontrada', 404, 'REVIEW_NOT_FOUND')
  }

  // ✅ Eliminar imagen si existe
  if (review.imagen?.public_id) {
    console.log('🗑 Eliminando imagen de opinión:', review.imagen.public_id)
    await cloudinary.uploader.destroy(review.imagen.public_id)
  }

  // ✅ Quitar la opinión del array
  product.opiniones.pull(review._id)

  // ✅ Recalcular calificación
  product.numCalificaciones = product.opiniones.length
  product.calificacion =
    product.opiniones.reduce((acc, r) => acc + r.rating, 0) / (product.numCalificaciones || 1)

  await product.save()

  res.json({ message: '✅ Opinión eliminada correctamente' })
})

export const canUserReviewProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id

  // Paso 1: Verificar si compró el producto
  const orders = await Order.find({
    user: req.user._id,
    isPaid: true,
    'orderItems.product': productId,
  })

  const hasPurchased = orders.length > 0

  if (!hasPurchased) {
    return res.json({ canReview: false }) // No lo compró => no puede opinar
  }

  // Paso 2: Verificar si ya dejó una opinión
  const product = await Product.findById(productId)

  if (!product) {
    throw new ApiError('❌ Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
  }

  const hasReviewed = product.opiniones.some(
    (opinion) => opinion.user.toString() === req.user._id.toString()
  )

  const canReview = hasPurchased && !hasReviewed

  res.json({ canReview })
})
