import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const { drawerWidth } = require('./Constants');
import { apiFetch } from './Controls/apiFetch';

export default function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await apiFetch('/api/logout', { method: 'POST', credentials: 'include' })
      .then(() => navigate('/login'));
  };

  return (
    <AppBar className='no-print' position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
      <Toolbar>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
         FOWCP Events Manager
        </Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
