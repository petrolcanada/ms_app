import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * SearchBar Component
 * Provides a debounced text input for searching funds by name, ticker, or manager
 * 
 * @param {Object} props
 * @param {function} props.onSearch - Callback function called with search term after debounce
 * @param {string} props.placeholder - Placeholder text for the input field
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 500)
 */
const SearchBar = ({ onSearch, placeholder = 'Search funds...', debounceMs = 500 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const onSearchRef = useRef(onSearch);

  // Keep ref updated with latest onSearch callback
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounce the search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchRef.current(searchTerm);
    }, debounceMs);

    // Cleanup function to clear timeout if searchTerm changes before delay
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debounceMs]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: 'background.paper',
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
    />
  );
};

export default SearchBar;
