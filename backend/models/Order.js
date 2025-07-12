import mongoose from 'mongoose'

// Subdocumento para cada ítem del pedido
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    talla: { type: Number, required: false }, // 👉 AGREGA ESTO
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

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],

    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // Pagado
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Estado de entrega
    isDelivered: { type: Boolean, default: false }, // ✅ NECESARIO
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
