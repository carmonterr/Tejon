import { v2 as cloudinary } from 'cloudinary'

export const generateCloudinarySignature = (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'banners'

    // ✅ generar firma correctamente
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET // 👈 corregido
    )

    // 🔍 debug log
    console.log('📝 Firma generada en backend:', {
      params: { folder, timestamp },
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      secretExists: !!process.env.CLOUDINARY_API_SECRET,
    })

    res.json({
      timestamp,
      signature,
      folder,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_NAME,
    })
  } catch (err) {
    console.error('❌ Error generando firma:', err)
    res.status(500).json({ message: 'Error generando firma' })
  }
}
