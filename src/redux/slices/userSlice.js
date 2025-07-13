import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import api from '../../utils/axios' // Importa tu instancia configurada con baseURL

// Estado inicial
const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

// Thunk para cargar usuario desde token
export const loadUserFromToken = createAsyncThunk('user/loadUserFromToken', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No hay token')

    const res = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })

    return { ...res.data, token }
  } catch (err) {
    // Limpiar token si no es válido o el usuario no existe
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error al cargar perfil')
  }
})

// Slice de usuario
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { _id, name, email, phone, address, isAdmin, token } = action.payload

      state.user = {
        _id,
        name,
        email,
        phone: phone || 'N/A',
        address: address || 'N/A',
        isAdmin: isAdmin || false,
        token,
      }

      localStorage.setItem('user', JSON.stringify(state.user))
      localStorage.setItem('token', token)
      state.status = 'succeeded'
    },
    logout: (state) => {
      state.user = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadUserFromToken.rejected, (state, action) => {
        console.error('Error al cargar usuario:', action.payload)
        state.user = null
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { loginSuccess, logout } = userSlice.actions
export default userSlice.reducer
