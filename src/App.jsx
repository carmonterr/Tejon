// src/App.js
import React, { useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './components/layout/Home'
import CartPage from './pages/CartPage'
import ProductPage from './pages/ProductPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PrivateRoute from './components/PrivateRoute'
import ProfilePage from './pages/ProfilePage'

import { useDispatch } from 'react-redux'
import { loadUserFromToken } from './redux/slices/userSlice'
import AdminLayout from './pages/admin/AdminLayout'
import ProductList from './pages/admin/ProductList'
import ProductForm from './components/admin/ProductForm'
import Dashboard from './pages/admin/Dashboard'

import UserList from './pages/admin/UserList'
import OrderSuccessPage from './pages/OrderSuccessPage'
import MisPedidosPage from './pages/MisPedidosPage'
import PedidoDetalle from './pages/PedidoDetalle'
import AdminOrdersPage from './pages/AdminOrdersPage'
import VentasPage from './pages/admin/VentasPage'
import ProductAdminDetail from './pages/admin/ProductAdminDetail'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { ToastContainer } from 'react-toastify'
import BannersPage from './pages/BannersPage'
import { Box, IconButton } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

import { Mode } from '@mui/icons-material'
import { useColorMode } from './ThemeContext'
import Contacto from './pages/Contacto'
import SobreNosotros from './pages/SobreNosotros'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad'
import MainLayout from './components/layout/MainLayout'
import ShippingScreen from './pages/ShippingScreen'

const App = () => {
  const dispatch = useDispatch()
  const { toggleColorMode } = useColorMode()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(loadUserFromToken())
    }
  }, [dispatch])

  return (
    <>
      {/* 🔘 Botón para cambiar tema */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 999 }}>
        <IconButton onClick={toggleColorMode} color="inherit">
          {Mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Box>

      <Header />
      <Routes>
        {/* Rutas públicas */}
        <Route element={<MainLayout />}></Route>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/shipping" element={<ShippingScreen />} />

        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/pedido-exitoso" element={<OrderSuccessPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/mis-pedidos"
          element={
            <PrivateRoute>
              <MisPedidosPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/pedido/:id"
          element={
            <PrivateRoute>
              <PedidoDetalle />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/products/:id"
          element={
            <PrivateRoute adminOnly={true}>
              <ProductAdminDetail />
            </PrivateRoute>
          }
        />

        {/* Rutas privadas o admin anidadas */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="products" element={<ProductList />} /> {/* /admin/products */}
          <Route path="products/new" element={<ProductForm />} /> {/* /admin/products/new */}
          <Route path="products/:id/edit" element={<ProductForm />} /> {/* ✅ FALTABA ESTA */}
          <Route path="users" element={<UserList />} /> {/* /admin/products/:id/edit */}
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="/admin/banners" element={<BannersPage />} />
          {/* Puedes agregar más rutas como usuarios, pedidos, etc. */}
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      <Footer />
    </>
  )
}

export default App
