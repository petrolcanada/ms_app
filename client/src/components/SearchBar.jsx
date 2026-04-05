import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const SearchBar = ({ onSearch, placeholder = 'Search funds...', debounceMs = 500, disabled = false, instant = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const delay = instant ? 250 : debounceMs;
    const timer = setTimeout(() => {
      onSearchRef.current(searchTerm);
    }, delay);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, instant]);

  return (
    <Box sx={{ flex: 1, position: 'relative' }}>
      <Box
        component="span"
        sx={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-4)',
          fontSize: '14px',
          pointerEvents: 'none',
        }}
      >
        &#128269;
      </Box>
      <Box
        component="input"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        disabled={disabled}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          padding: '10px 14px 10px 38px',
          outline: 'none',
          transition: 'border-color var(--transition)',
          '&::placeholder': { color: 'var(--text-4)' },
          '&:focus': { borderColor: 'var(--emerald)' },
        }}
      />
    </Box>
  );
};

export default SearchBar;
