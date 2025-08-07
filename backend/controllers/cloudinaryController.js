import { v2 as cloudinary } from 'cloudinary'

export const generateCloudinarySignature = (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'banners'

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_SECRET
  )

  res.json({
    timestamp,
    signature,
    folder,
    api_key: process.env.CLOUDINARY_KEY,
    cloud_name: process.env.CLOUDINARY_NAME,
  })
}
