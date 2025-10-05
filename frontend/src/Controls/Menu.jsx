import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import useCurrentUser from '../hooks/useCurrentUser'

const { drawerWidth } = require('../Constants');

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  return (
    <Drawer className='no-print' open={true} sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
      },
    }} variant="permanent"
      anchor="left">
      <List sx={{ width: 200 }}>

        <ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/' ||
            location.pathname.startsWith('/add-event') ||
            location.pathname.startsWith('/failedpayments') ||
            location.pathname.startsWith('/edit') ||
            location.pathname.startsWith('/summary') ||
            location.pathname.startsWith('/registrations') ||
            location.pathname.startsWith('/giftaid')
          } onClick={() => navigate('/')}>
            <ListItemText primary="Events" />
          </ListItemButton>
        </ListItem>
        {user?.IsAdmin && (<ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/users'} onClick={() => navigate('/users')}>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>)}

      </List></Drawer>
  );
};

export default Menu;
