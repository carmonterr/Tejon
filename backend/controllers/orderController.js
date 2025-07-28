import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/userModel.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

// ✅ Crear un nuevo pedido
export const createdOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingPrice, totalPrice } = req.body

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError('❌ No hay productos en el pedido', 400, 'ORDER_ITEMS_REQUIRED')
  }

  const user = await User.findById(req.user._id)

  if (
    !user ||
    !user.shippingAddress ||
    !user.shippingAddress.address?.trim() ||
    !user.shippingAddress.city?.trim() ||
    !user.shippingAddress.country?.trim() ||
    !user.phone?.trim()
  ) {
    throw new ApiError(
      '❌ Falta información de envío en el perfil del usuario',
      400,
      'SHIPPING_INFO_MISSING'
    )
  }

  const newOrder = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress: {
      address: user.shippingAddress.address,
      city: user.shippingAddress.city,
      country: user.shippingAddress.country,
      phone: user.phone,
    },
    shippingPrice,
    totalPrice,
  })

  const createdOrder = await newOrder.save()

  res.status(201).json(createdOrder)
})

// ✅ Obtener pedidos del usuario autenticado
// ✅ Obtener pedidos del usuario autenticado
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })

  res.json(orders)
})

// ✅ Obtener un pedido por ID
// ✅ Obtener un pedido por ID (usuario o admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone address')

  if (!order) {
    throw new ApiError('❌ Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  const isOwner = order.user._id.toString() === req.user._id.toString()
  const isAdmin = req.user.isAdmin

  if (!isOwner && !isAdmin) {
    throw new ApiError('🚫 No estás autorizado a ver este pedido', 403, 'UNAUTHORIZED_ORDER_ACCESS')
  }

  res.json(order)
})

// ✅ Marcar como pagado
// ✅ Marcar como pagado + actualizar stock y vendidos
export const marcarComoPagado = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError('❌ Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  if (order.isPaid) {
    throw new ApiError('⚠️ Este pedido ya está pagado.', 400, 'ORDER_ALREADY_PAID')
  }

  // ✅ Marcar como pagado
  order.isPaid = true
  order.paidAt = Date.now()

  await order.save()

  // ✅ Actualizar inventario y contador de vendidos
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product)
    if (!product) continue

    const newStock = Math.max(0, product.inventario - item.qty)

    await Product.findByIdAndUpdate(item.product, {
      inventario: newStock,
      $inc: { sold: item.qty },
    })
  }

  res.json({
    message: '✅ Pedido marcado como pagado y stock actualizado',
    order,
  })
})

// ✅ Marcar como entregado
export const marcarComoEntregado = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError('❌ Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  order.isDelivered = true
  order.deliveredAt = Date.now()
  order.deliveryStatus = 'entregado'

  const updated = await order.save()

  res.status(200).json({
    message: '📦 Pedido marcado como entregado',
    order: updated,
  })
})

// ✅ Marcar como en tránsito
export const marcarComoEnTransito = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError('❌ Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  order.deliveryStatus = 'en tránsito'
  const updated = await order.save()

  res.json({
    message: '🚚 Pedido en tránsito',
    order: updated,
  })
})

// ✅ Obtener todos los pedidos con búsqueda avanzada y filtros

// 🔤 Quitar tildes y acentos
const normalizeText = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// ✅ Obtener todos los pedidos (con búsqueda y filtros)
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const rawSearch = req.query.search || ''
  const search = normalizeText(rawSearch)

  const estado = req.query.estado || ''
  const from = req.query.from ? new Date(req.query.from) : null
  const to = req.query.to ? new Date(req.query.to) : null
  if (to) to.setHours(23, 59, 59, 999)

  const matchStage = {}

  // Filtros por estado
  if (estado === 'pagado') matchStage.isPaid = true
  if (estado === 'pendiente') matchStage.isPaid = false
  if (estado === 'entregado') matchStage.isDelivered = true

  // Filtro por fechas
  if (from || to) {
    matchStage.createdAt = {}
    if (from) matchStage.createdAt.$gte = from
    if (to) matchStage.createdAt.$lte = to
  }

  // Buscar usuarios por nombre o correo si aplica
  let userIds = []
  const isMongoId = /^[a-f\d]{24}$/i.test(search)

  if (search && !isMongoId) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id')
    userIds = users.map((u) => u._id)
  }

  const pipeline = [
    { $match: matchStage },

    // Join con usuario
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'usuario',
      },
    },
    {
      $unwind: {
        path: '$usuario',
        preserveNullAndEmptyArrays: true,
      },
    },

    // Filtro de búsqueda
    ...(search
      ? [
          {
            $match: {
              $or: [
                ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
                {
                  $expr: {
                    $regexMatch: {
                      input: { $toString: '$_id' },
                      regex: new RegExp(search, 'i'),
                    },
                  },
                },
              ],
            },
          },
        ]
      : []),

    {
      $facet: {
        orders: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
        totalVentas: [
          {
            $group: {
              _id: null,
              total: { $sum: '$totalPrice' },
            },
          },
        ],
      },
    },
  ]

  const result = await Order.aggregate(pipeline)

  const orders = result[0].orders
  const total = result[0].totalCount[0]?.count || 0
  const totalVentas = result[0].totalVentas[0]?.total || 0

  // Reasignar .usuario como .user (compatibilidad frontend)
  const mappedOrders = orders.map((order) => ({
    ...order,
    user: order.usuario,
  }))

  res.json({
    orders: mappedOrders,
    page,
    pages: Math.ceil(total / limit),
    total,
    totalVentas,
  })
})

// ✅ Revertir solo el pago
export const revertirPago = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError('❌ Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  if (!order.isPaid) {
    throw new ApiError('⚠️ El pedido ya está marcado como no pagado.', 400, 'ORDER_NOT_PAID')
  }

  // 🔄 Revertir el pago
  order.isPaid = false
  order.paidAt = null
  await order.save()

  // 🔄 Restaurar stock e inventario
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product)
    if (!product) continue

    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        inventario: item.qty,
        sold: -item.qty,
      },
    })
  }

  res.json({
    message: '🔁 Pago revertido y stock restaurado',
    order,
  })
})

// ✅ Eliminar pedido (solo si no está pagado)
export const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Pedido no encontrado' })

  if (order.isPaid) {
    return res.status(400).json({ message: 'No se puede eliminar un pedido pagado' })
  }

  await order.deleteOne()
  res.json({ message: '🗑 Pedido eliminado correctamente' })
}

// ✅ Estadísticas por fechas
export const obtenerEstadisticasPedidos = asyncHandler(async (req, res) => {
  const { from, to } = req.query

  if (!from || !to) {
    throw new ApiError('Las fechas "from" y "to" son requeridas', 400, 'DATES_REQUIRED')
  }

  const fechaInicio = new Date(from)
  const fechaFin = new Date(to)
  fechaFin.setHours(23, 59, 59, 999)

  const resultado = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        cantidad: { $sum: 1 },
      },
    },
  ])

  const data = resultado[0] || { total: 0, cantidad: 0 }

  res.json({
    total: data.total,
    cantidad: data.cantidad,
  })
})
