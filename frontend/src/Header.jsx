import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const { drawerWidth } = require('./Constants');

export default function Header() {
  const navigate = useNavigate();
  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .then(() => navigate('/login'));
  };

  return (
    <AppBar  className='no-print' position="fixed"  sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
      <Toolbar>
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Events Manager
        </Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
