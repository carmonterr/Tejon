// src/redux/slices/cartSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartItems: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload
      const existingItem = state.cartItems.find((p) => p._id === item._id)

      if (existingItem) {
        // Actualizar o agregar tallas nuevas
        item.tallas.forEach(({ talla, qty }) => {
          const existingTalla = existingItem.tallas.find((t) => t.talla === talla)
          if (existingTalla) {
            existingTalla.qty += qty
          } else {
            existingItem.tallas.push({ talla, qty })
          }
        })
      } else {
        state.cartItems.push({
          ...item,
          tallas: item.tallas.map(({ talla, qty }) => ({ talla, qty })),
        })
      }
    },

    updateQty: (state, action) => {
      const { id, talla, qty } = action.payload
      const item = state.cartItems.find((i) => i._id === id)
      if (item) {
        const tallaItem = item.tallas.find((t) => t.talla === talla)
        if (tallaItem) {
          tallaItem.qty = qty
        }
      }
    },

    removeFromCart: (state, action) => {
      const { id, talla } = action.payload
      const item = state.cartItems.find((i) => i._id === id)

      if (item) {
        item.tallas = item.tallas.filter((t) => t.talla !== talla)
        if (item.tallas.length === 0) {
          state.cartItems = state.cartItems.filter((i) => i._id !== id)
        }
      }
    },

    clearCart: (state) => {
      state.cartItems = []
    },
  },
})

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions
export default cartSlice.reducer
