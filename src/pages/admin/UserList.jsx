import React, { useEffect, useState } from 'react'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SearchIcon from '@mui/icons-material/Search'
import Pagination from '@mui/material/Pagination'
import { useForm } from 'react-hook-form'

import API from '../../api/axios'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const fetchUsers = async (pageNumber = 1, searchQuery = '') => {
    try {
      const { data } = await API.get('/users', {
        params: {
          page: pageNumber,
          limit: 5,
          search: searchQuery,
        },
      })
      const usersArray = Array.isArray(data.users) ? data.users : []
      setUsers(usersArray)
      setPage(Number(data.page) || 1)
      setTotalPages(Number(data.pages) || 1)
    } catch (err) {
      console.error('⛔ Error al obtener usuarios:', err)
      setUsers([])
      setPage(1)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page, search)
  }, [page, search])

  const handlePageChange = (_, value) => {
    setPage(value)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return
    try {
      await API.delete(`/users/${id}`)
      fetchUsers(page, search)
    } catch (err) {
      console.error('⛔ Error al eliminar usuario:', err)
    }
  }

  const toggleAdmin = async (user) => {
    try {
      const updated = { ...user, isAdmin: !user.isAdmin }
      await API.put(`/users/${user._id}`, updated)
      fetchUsers(page, search)
    } catch (err) {
      console.error('⛔ Error al cambiar rol:', err)
    }
  }

  const openEditModal = (user) => {
    setEditUser(user)
    reset(user)
  }

  const handleEditSubmit = async (data) => {
    try {
      await API.put(`/users/${editUser._id}`, data)
      setEditUser(null)
      fetchUsers(page, search)
    } catch (err) {
      console.error('⛔ Error al actualizar usuario:', err)
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Lista de Usuarios
      </Typography>

      <TextField
        label="Buscar por nombre o email"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress color="primary" />
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.address || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title={user.isAdmin ? 'Administrador' : 'Usuario'}>
                        <Switch
                          checked={user.isAdmin}
                          onChange={() => toggleAdmin(user)}
                          color="primary"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openEditModal(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user._id)}>
                        <DeleteIcon />
                      </IconButton>
                      {user.isAdmin && <AdminPanelSettingsIcon color="disabled" />}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <Dialog open={!!editUser} onClose={() => setEditUser(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <form id="edit-user-form" onSubmit={handleSubmit(handleEditSubmit)}>
            <TextField
              margin="dense"
              label="Nombre"
              fullWidth
              {...register('name', { required: 'Nombre obligatorio' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              type="email"
              {...register('email', { required: 'Email obligatorio' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField margin="dense" label="Teléfono" fullWidth {...register('phone')} />
            <TextField margin="dense" label="Dirección" fullWidth {...register('address')} />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancelar</Button>
          <Button type="submit" form="edit-user-form" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserList
