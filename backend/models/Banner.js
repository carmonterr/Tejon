import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String }, // opcional
    description: { type: String }, // opcional

    image: {
      url: { type: String, required: true }, // ✅ obligatorio
      public_id: { type: String, required: true }, // ✅ obligatorio
    },

    link: { type: String, default: '/' }, // opcional con valor por defecto
    order: { type: Number, default: 0 }, // opcional con valor por defecto

    align: {
      type: String,
      enum: ['left', 'right'],
      default: 'left',
    },
  },
  {
    timestamps: true,
  }
)

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner
