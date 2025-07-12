import User from '../models/userModel.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import ApiError from '../utils/ApiError.js'

// GET /api/admin/users/count
export const getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments()
    res.json({ totalUsers: count })
  } catch (error) {
    console.error('⛔ Error al contar usuarios:', error)

    next(
      new ApiError(
        '❌ Error al obtener la cantidad de usuarios',
        500,
        'USER_COUNT_ERROR',
        error?.errors || null
      )
    )
  }
}

// GET /api/admin/orders/summary
export const getOrderStats = async (req, res, next) => {
  try {
    const orders = await Order.find()

    const totalOrders = orders.length
    const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0)

    res.json({ totalOrders, totalAmount })
  } catch (error) {
    console.error('⛔ Error al obtener resumen de pedidos:', error)

    next(
      new ApiError(
        '❌ Error al obtener estadísticas de pedidos',
        500,
        'ORDER_STATS_ERROR',
        error?.errors || null
      )
    )
  }
}

// GET /api/admin/products/summary
export const getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments()
    const outOfStock = await Product.countDocuments({ countInStock: 0 })

    res.json({ totalProducts, outOfStock })
  } catch (error) {
    console.error('⛔ Error al obtener resumen de productos:', error)

    next(
      new ApiError(
        '❌ Error al obtener estadísticas de productos',
        500,
        'PRODUCT_STATS_ERROR',
        error?.errors || null
      )
    )
  }
}

export const getOrderSummary = async (req, res, next) => {
  try {
    const totalPedidos = await Order.countDocuments()

    const resultado = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: '$totalPrice' },
        },
      },
    ])

    const totalVentas = resultado[0]?.totalVentas || 0

    res.json({ totalPedidos, totalVentas })
  } catch (error) {
    console.error('⛔ Error al obtener resumen de pedidos:', error)

    next(
      new ApiError(
        '❌ Error al obtener el resumen de pedidos',
        500,
        'ORDER_SUMMARY_ERROR',
        error?.errors || null
      )
    )
  }
}

export const getVentasPorFecha = async (req, res, next) => {
  try {
    const { from, to, tipo } = req.query

    if (!from || !to) {
      return next(
        new ApiError('⚠️ Las fechas "from" y "to" son requeridas', 400, 'DATE_RANGE_REQUIRED')
      )
    }

    const fechaInicio = new Date(from)
    const fechaFin = new Date(to)
    fechaFin.setHours(23, 59, 59, 999)

    const agruparPor =
      tipo === 'mes'
        ? { $dateToString: { format: '%Y-%m', date: '$paidAt' } }
        : { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }

    const resumen = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: fechaInicio, $lte: fechaFin },
        },
      },
      {
        $group: {
          _id: agruparPor,
          totalVentas: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const data = resumen.map((item) => ({
      fecha: item._id,
      totalVentas: item.totalVentas,
    }))

    res.json(data)
  } catch (error) {
    console.error('⛔ Error al calcular ventas por fecha:', error)

    next(
      new ApiError(
        '❌ Error al calcular las ventas por fecha',
        500,
        'VENTAS_POR_FECHA_ERROR',
        error?.errors || null
      )
    )
  }
}
