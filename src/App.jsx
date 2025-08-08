import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShortenerPage from './pages/ShortenerPage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ mr: 2 }}
            >
              Shorten
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/stats"
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Routes>
        <Route path="/" element={<ShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 