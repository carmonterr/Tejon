// models/Order.js
import mongoose from 'mongoose'

// Subdocumento para cada ítem del pedido
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    talla: { type: Number, required: false },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { _id: false }
)

// Subdocumento para dirección de envío
const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    orderItems: [orderItemSchema],

    // 👇 Agregamos la dirección de envío al modelo
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // Pagado
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Estado de entrega
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // Estado intermedio opcional
    deliveryStatus: {
      type: String,
      enum: ['pendiente', 'en tránsito', 'entregado'],
      default: 'pendiente',
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
