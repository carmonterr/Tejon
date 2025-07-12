// import React from 'react'
// import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import AdminLayout from '../components/admin/AdminLayout'

// import AdminProductPage from '../pages/admin/ProductForm'

// const AdminRoutes = () => {
//   const { user } = useSelector((state) => state.user)

//   if (!user || !user.isAdmin) {
//     return <Navigate to="/login" />
//   }

//   return (
//     <Routes>
//       <Route element={<AdminLayout />}>
//         <Route index element={<Dashboard />} />
    
//         <Route path="products/new" element={<AdminProductPage />} />
//         <Route path="products/:id/edit" element={<AdminProductPage />} />
//       </Route>
//     </Routes>
//   )
// }

// export default AdminRoutes

