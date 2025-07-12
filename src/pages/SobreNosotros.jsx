import React from 'react'
import { Container, Typography } from '@mui/material'

const SobreNosotros = () => (
  <Container sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Sobre Nosotros
    </Typography>
    <Typography variant="body1">
      Somos una tienda online desarrollada con el stack MERN. Nuestro objetivo es ofrecer productos
      de calidad con excelente experiencia de usuario.
    </Typography>
  </Container>
)

export default SobreNosotros
