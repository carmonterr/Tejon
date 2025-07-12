import React from 'react'
import PropTypes from 'prop-types'
import { styled, alpha } from '@mui/material/styles'
import { Box, InputBase, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

const Search = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  maxWidth: 350,
  display: 'flex',
  alignItems: 'center',
}))

const SearchIconWrapper = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  color: 'inherit',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  paddingLeft: theme.spacing(2),
  transition: theme.transitions.create('width'),
}))

const SearchBar = ({ searchText, setSearchText, onSubmit }) => {
  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'flex' },
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 350 }}>
        <Search onSubmit={onSubmit}>
          <StyledInputBase
            placeholder="Buscar productos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            inputProps={{ 'aria-label': 'buscar' }}
          />
          <SearchIconWrapper type="submit">
            <SearchIcon />
          </SearchIconWrapper>
        </Search>
      </Box>
    </Box>
  )
}

// ✅ Validación de props con PropTypes
SearchBar.propTypes = {
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default SearchBar
