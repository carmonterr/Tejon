// ✅ src/utils/uploadImage.js
export const uploadImage = async (file) => {
  const cloudName = 'dxms9j4jb'
  const uploadPreset = 'mern_unsigned'

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Error al subir imagen')
  }

  // ✅ Devolver en formato correcto
  return {
    public_id: data.public_id,
    url: data.secure_url,
  }
}
