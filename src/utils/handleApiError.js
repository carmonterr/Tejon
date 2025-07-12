import { toast } from 'react-toastify'

export const handleApiError = (error, setFieldErrors = null) => {
  const res = error.response?.data

  if (res?.code === 'VALIDATION_ERROR' && Array.isArray(res.errors)) {
    toast.error('⚠️ Corrige los campos indicados.')

    if (setFieldErrors) {
      const formatted = {}
      res.errors.forEach((e) => {
        if (e.field) formatted[e.field] = e.message
      })
      setFieldErrors(formatted)
    }
  } else if (res?.message) {
    toast.error(res.message)
  } else {
    toast.error('❌ Error inesperado. Intenta nuevamente.')
  }
}
