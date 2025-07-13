// src/redux/slices/productSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import api from '../../utils/axios'

// 🔍 Backend paginado + filtros
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, thunkAPI) => {
    try {
      const { search = '', categoria = '', sort = 'newest', page = 1, limit = 8 } = params

      const res = await api.get('/products', {
        params: { search, categoria, sort, page, limit },
      })

      return res.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error al cargar productos')
    }
  }
)

const initialState = {
  products: [], // 👉 Lista actual
  total: 0, // 👉 Total de registros
  page: 1,
  pages: 1,
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,

  reducers: {
    // ⏳ En el futuro puedes agregar filtros locales aquí si los necesitas
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.total = action.payload.total
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error desconocido'
      })
  },
})

export default productSlice.reducer
