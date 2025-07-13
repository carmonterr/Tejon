import React, { useEffect, useState, useCallback } from 'react'
import { Box, Button, IconButton } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

import API from '../api/axios' // ✅ usamos instancia configurada con baseURL

const BannerCarousel = () => {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await API.get('api/banners') // ✅ correcto: irá a https://tu-backend/api/banners
        const sorted = res.data.sort((a, b) => a.order - b.order)
        setBanners(sorted)
      } catch (err) {
        console.error('Error al cargar banners', err)
      }
    }

    fetchBanners()
  }, [])

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      handleNext()
    }, 8000)
    return () => clearInterval(interval)
  }, [handleNext, banners.length])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  if (!banners.length) return null

  return (
    <Box
      {...swipeHandlers}
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 180, sm: 300, md: 400 },
        overflow: 'hidden',
        borderRadius: 2,
        mb: 0,
      }}
    >
      {banners.map((banner, index) => (
        <AnimatePresence key={banner._id}>
          {current === index && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${banner.image?.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: banner.align === 'right' ? 'flex-end' : 'flex-start',
                  px: { xs: 2, sm: 4, md: 10 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: banner.align === 'right' ? 'flex-end' : 'flex-start',
                    gap: 2,
                  }}
                >
                  {banner.title && (
                    <Box
                      sx={{
                        backgroundColor: 'secondary.main',
                        color: '#fff',
                        px: 3,
                        py: 1,
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.4)',
                        textTransform: 'uppercase',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.05)' },
                          '100%': { transform: 'scale(1)' },
                        },
                      }}
                    >
                      {banner.title}
                    </Box>
                  )}

                  {banner.description && (
                    <Box
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(5px)',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        color: '#fff',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        maxWidth: { xs: '90%', sm: '70%', md: '50%' },
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {banner.description}
                    </Box>
                  )}

                  {banner.link && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => (window.location.href = banner.link)}
                    >
                      Ver más
                    </Button>
                  )}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Flechas */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          zIndex: 5,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 10,
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          zIndex: 5,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          zIndex: 5,
        }}
      >
        {banners.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setCurrent(idx)}
            sx={{
              width: current === idx ? 14 : 10,
              height: current === idx ? 14 : 10,
              borderRadius: '50%',
              backgroundColor: current === idx ? 'secondary.main' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default BannerCarousel
