// src/utils/axios.js
import axios from 'axios'

// Creamos una instancia personalizada
const api = axios.create({
  baseURL: '/api', // gracias al proxy de Vite, esto apunta a localhost:5000
})

// Interceptor para agregar el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token inválido o expirado. Redirigiendo al login...')
      localStorage.removeItem('token')
      window.location.href = '/login' // o redirecciona con react-router
    }

    return Promise.reject(error)
  }
)

export default api
