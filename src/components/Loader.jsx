import React from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

const Loader = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="50vh"
    >
      <CircularProgress color="primary" />
      <Typography variant="h6" mt={2}>
        Cargando...
      </Typography>
    </Box>
  )
}

export default Loader
