import API from '../api/axios'

export const uploadToCloudinary = async (file, token) => {
  const sigRes = await API.post(
    'api/cloudinary/signature',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  console.log('🛠️ Respuesta del backend para firma:', sigRes.data)

  const { timestamp, signature, api_key, cloud_name, folder } = sigRes.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', api_key)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  console.log('📤 Enviando a Cloudinary:', {
    timestamp,
    signature,
    folder,
    api_key,
  })

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Error al subir imagen')
  }

  return {
    public_id: data.public_id,
    url: data.secure_url,
  }
}
