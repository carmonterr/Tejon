import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'green' }} />
        <Typography variant="h4" sx={{ mt: 2 }}>
          ¡Gracias por tu compra!
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {user?.name || 'Cliente'}, tu pedido fue recibido correctamente.
        </Typography>
        <Typography sx={{ mt: 2, color: 'gray' }}>
          En breve recibirás un correo con los detalles. También puedes revisar el historial en tu panel.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Volver a la tienda
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/mis-pedidos')}>
            Ver mis pedidos
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;
