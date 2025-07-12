// src/routes/adminRoutes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminRoute from '../components/AdminRoute'

// Layout y páginas del admin
import AdminLayout from '../pages/admin/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import ProductList from '../pages/admin/ProductList'
import ProductForm from '../components/admin/ProductForm'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
      </Route>
    </Routes>
  )
}

export default AdminRoutes




