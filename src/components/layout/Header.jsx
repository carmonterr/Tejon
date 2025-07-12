import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../redux/slices/userSlice'
import SearchBar from './SearchBar' // 🆕 Importamos el buscador modularizado

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [infoMenuAnchor, setInfoMenuAnchor] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const cartItems = useSelector((state) => state.cart.cartItems)
  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.tallas.reduce((sum, t) => sum + t.qty, 0),
    0
  )

  const user = useSelector((state) => state.user.user)

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    const query = searchText.trim()
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`)
      setSearchText('')
    } else {
      navigate('/')
    }
  }

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const handleLogout = () => {
    dispatch(logout())
    handleCloseMenu()
    navigate('/')
  }

  const handleOpenInfoMenu = (event) => setInfoMenuAnchor(event.currentTarget)
  const handleCloseInfoMenu = () => setInfoMenuAnchor(null)

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open)
  }

  const drawerLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Contacto', path: '/contacto' },
    { label: 'Sobre Nosotros', path: '/sobre-nosotros' },
    { label: 'Privacidad', path: '/politica-privacidad' },
    ...(user
      ? [
          { label: 'Mi Perfil', path: '/perfil' },
          { label: 'Mis Pedidos', path: '/mis-pedidos' },
        ]
      : [
          { label: 'Iniciar sesión', path: '/login' },
          { label: 'Registrarse', path: '/register' },
        ]),
    { label: 'Carrito', path: '/cart' },
  ]

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#111' }}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: 2,
          }}
        >
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'white', flexShrink: 0 }}
          >
            Tienda MERN
          </Typography>

          {/* 🧠 Buscador modularizado */}
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onSubmit={handleSubmitSearch}
          />

          {/* Botones lado derecho */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {user ? (
              <>
                <Typography
                  variant="body2"
                  onClick={handleOpenMenu}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Hola, {user.name}
                </Typography>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {user.isAdmin && (
                    <MenuItem component={Link} to="/admin/products" onClick={handleCloseMenu}>
                      Adm. Productos
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/mis-pedidos" onClick={handleCloseMenu}>
                    Pedidos
                  </MenuItem>
                  <MenuItem component={Link} to="/perfil" onClick={handleCloseMenu}>
                    Mi Perfil
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" sx={{ color: 'white', textTransform: 'none' }}>
                  Iniciar sesión
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Registrarse
                </Button>
              </>
            )}

            <IconButton component={Link} to="/cart" sx={{ color: 'white' }}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <Button component={Link} to="/" sx={{ color: 'white', textTransform: 'none' }}>
              Inicio
            </Button>

            <Button
              color="inherit"
              onClick={handleOpenInfoMenu}
              endIcon={<ExpandMoreIcon />}
              sx={{ textTransform: 'none' }}
            >
              Información
            </Button>
            <Menu
              anchorEl={infoMenuAnchor}
              open={Boolean(infoMenuAnchor)}
              onClose={handleCloseInfoMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem component={Link} to="/contacto" onClick={handleCloseInfoMenu}>
                Contacto
              </MenuItem>
              <MenuItem component={Link} to="/sobre-nosotros" onClick={handleCloseInfoMenu}>
                Sobre Nosotros
              </MenuItem>
              <MenuItem component={Link} to="/politica-privacidad" onClick={handleCloseInfoMenu}>
                Privacidad
              </MenuItem>
            </Menu>

            {isMobile && (
              <IconButton color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      {/* Drawer para móvil */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {drawerLinks.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton component={Link} to={link.path}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {user && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}

export default Header
