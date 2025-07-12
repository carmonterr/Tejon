import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard,
  Store as StoreIcon,
  AddBox as AddBoxIcon,
  People,
  ShoppingCart,
  AttachMoney,
  Menu,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import CampaignIcon from '@mui/icons-material/Campaign'

const drawerWidth = 240
const appBarHeight = 64 // altura estándar del Header (AppBar)

const AdminSidebar = () => {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const menu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Productos', icon: <StoreIcon />, path: '/admin/products' },
    { text: 'Crear producto', icon: <AddBoxIcon />, path: '/admin/products/new' },
    { text: 'Usuarios', icon: <People />, path: '/admin/users' },
    { text: 'Pedidos', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Ventas', icon: <AttachMoney />, path: '/admin/ventas' },
    { text: 'Banners', icon: <CampaignIcon />, path: '/admin/banners' },
  ]

  const drawerContent = (
    <Box>
      <List>
        {menu.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e0e0e0',
                  fontWeight: 'bold',
                  color: 'primary.main',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#d5d5d5',
                },
              }}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      {/* Botón para abrir Drawer en móvil */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 2,
            color: 'white',
            backgroundColor: 'black',
          }}
        >
          <Menu />
        </IconButton>
      )}

      {/* Drawer permanente (escritorio) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
              top: `${appBarHeight}px`,
              height: `calc(100% - ${appBarHeight}px)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Drawer temporal (móvil) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
              top: `${appBarHeight}px`,
              height: `calc(100% - ${appBarHeight}px)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}

export default AdminSidebar
