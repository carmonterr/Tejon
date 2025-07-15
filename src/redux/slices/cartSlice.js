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

      // Buscar por uniqueId en lugar de _id
      const existingItem = state.cartItems.find((p) => p.uniqueId === item.uniqueId)

      if (existingItem) {
        // Sumar cantidades por talla
        item.tallas.forEach(({ talla, qty }) => {
          const existingTalla = existingItem.tallas.find((t) => t.talla === talla)
          if (existingTalla) {
            existingTalla.qty += qty
          } else {
            existingItem.tallas.push({ talla, qty })
          }
        })
      } else {
        // Agregar nuevo ítem al carrito
        state.cartItems.push({
          ...item,
          tallas: item.tallas.map(({ talla, qty }) => ({ talla, qty })),
        })
      }
    },

    updateQty: (state, action) => {
      const { uniqueId, talla, qty } = action.payload
      const item = state.cartItems.find((i) => i.uniqueId === uniqueId)
      if (item) {
        const tallaItem = item.tallas.find((t) => t.talla === talla)
        if (tallaItem) {
          tallaItem.qty = qty
        }
      }
    },

    removeFromCart: (state, action) => {
      const { uniqueId, talla } = action.payload
      const item = state.cartItems.find((i) => i.uniqueId === uniqueId)

      if (item) {
        item.tallas = item.tallas.filter((t) => t.talla !== talla)
        if (item.tallas.length === 0) {
          state.cartItems = state.cartItems.filter((i) => i.uniqueId !== uniqueId)
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
