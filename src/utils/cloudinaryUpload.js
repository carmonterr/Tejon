import API from '../api/axios'

export const uploadToCloudinary = async (file, token) => {
  const sigRes = await API.post(
    'api/cloudinary/signature',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  const { timestamp, signature, api_key, cloud_name, folder } = sigRes.data

  // 🔍 debug log antes de subir
  console.log('🔍 FormData que se enviará a Cloudinary:', {
    file: file.name,
    api_key,
    timestamp,
    signature,
    folder,
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', api_key)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!res.ok || !data.secure_url) {
    console.error('❌ Error desde Cloudinary:', data)
    throw new Error(data.error?.message || 'Error al subir imagen')
  }

  console.log('✅ Imagen subida con éxito:', data)

  return {
    public_id: data.public_id,
    url: data.secure_url,
  }
}
