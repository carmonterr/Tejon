import { configureStore } from '@reduxjs/toolkit'
import productReducer from './slices/productSlice'
import userReducer from './slices/userSlice'
import cartReducer from './slices/cartSlice' // asumo que ya lo tienes

const store = configureStore({
  reducer: {
    product: productReducer,
    user: userReducer,
    cart: cartReducer,
   
  },
})

export default store
