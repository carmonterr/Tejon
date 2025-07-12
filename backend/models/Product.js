import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'Por favor el nombre del producto'],
      trim: true,
      maxLength: [120, 'El nombre no debe exceder los 120 caracteres'],
    },

    precio: {
      type: Number,
      required: [true, 'Por favor registre el precio del producto.'],
      maxLength: [8, 'El precio del producto no puede estar por encima de 99.999.999'],
      default: 0.0,
    },

    descripcion: {
      type: String,
      required: [true, 'Por favor registre una descripción del producto'],
    },

    imagen: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    calificacion: {
      type: Number,
      default: 0,
    },

    numCalificaciones: {
      type: Number,
      default: 0,
    },

    opiniones: [
      {
        nombreCliente: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comentario: {
          type: String,
          required: true,
        },
        imagen: {
          url: { type: String },
          public_id: { type: String },
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    categoria: {
      type: String,
      required: [true, 'Por favor seleccione la categoría del producto'],
      enum: {
        values: ['Juvenil', 'Dama', 'Señorial'],
        message: 'Categoría no válida',
      },
    },

    tallasDisponibles: {
      type: [Number], // Ejemplo: [35, 36, 37, 38, 39, 40]
      validate: {
        validator: function (arr) {
          return arr.every((talla) => [35, 36, 37, 38, 39, 40].includes(talla))
        },
        message: 'Tallas inválidas',
      },
      required: [true, 'Por favor registre las tallas disponibles'],
    },

    vendedor: {
      type: String,
      required: [true, 'Por favor registre el vendedor del producto'],
    },

    inventario: {
      type: Number,
      required: [true, 'Por favor registre el stock del producto'],
      maxLength: [5, 'Cantidad máxima del producto no puede sobrepasar 99999'],
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model('Product', productSchema)
export default Product
