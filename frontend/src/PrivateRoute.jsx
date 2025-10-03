import { useEffect, useState } from 'react';
import {Navigate, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from './Controls/apiFetch';
import { Typography } from '@mui/material';

const { apiUrl } = require('./Constants');

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const eventId = sessionStorage.getItem('eventId'); //Event Helper Login
    
        if (eventId != null) {
           setAuth(true);
          if (location.pathname !== '/checkin/') {
           
            navigate('/checkin/');
          }
        }
        else {

          if (location.pathname === '/checkin/') {
            navigate('/');
          }

          const res = await apiFetch(`${apiUrl}/checkAuth`);
          const data = await res.json();
          setAuth(data.authenticated);
        }
      } catch (err) {
        console.error('Auth check failed', err);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return <Typography>No Access</Typography>;
  if (!auth) return <Navigate to="/login" />;
  return children;
}
