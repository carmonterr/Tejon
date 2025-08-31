import { v2 as cloudinary } from 'cloudinary'

export const generateCloudinarySignature = (req, res, next) => {
  try {
    // ⏱ Generamos timestamp fresco
    const timestamp = Math.floor(Date.now() / 1000)

    // 📂 Carpeta destino
    const folder = 'banners'

    // ✍️ Firma
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_SECRET
    )

    // 🔍 Log (puedes quitarlo en prod)
    console.log('Signature endpoint:', {
      stringToSign: `folder=${folder}&timestamp=${timestamp}`,
      signature,
      timestamp,
      isoTime: new Date(timestamp * 1000).toISOString(),
    })

    // 📤 Respuesta al frontend
    res.json({
      timestamp,
      signature,
      folder,
      api_key: process.env.CLOUDINARY_KEY,
      cloud_name: process.env.CLOUDINARY_NAME,
    })
  } catch (err) {
    // 🔄 Delega al middleware de errores
    next(err)
  }
}

// import { v2 as cloudinary } from 'cloudinary'

// export const generateCloudinarySignature = (req, res) => {
//   const timestamp = Math.floor(Date.now() / 1000)
//   const folder = 'banners'

//   const signature = cloudinary.utils.api_sign_request(
//     { timestamp, folder },
//     process.env.CLOUDINARY_SECRET
//   )

//   res.json({
//     timestamp,
//     signature,
//     folder,
//     api_key: process.env.CLOUDINARY_KEY,
//     cloud_name: process.env.CLOUDINARY_NAME,
//   })
// }
