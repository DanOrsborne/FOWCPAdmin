import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
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
          else {
            //Validate eventid and password are still correct
            const password = sessionStorage.getItem('password'); //Event Helper Login

            const eventData = await fetchEventData(eventId);

            if (eventData == null || eventData.EventPassword !== password) {
              console.log("Event Password mismatch");
              sessionStorage.removeItem('eventId');
              sessionStorage.removeItem('password');
              setAuth(false);
              navigate('/login');
            }
          }
        }
        else {

         
          console.log("Pathname:", location.pathname);
          if (location.pathname === '/checkin/') { //this page is only for event helpers
            navigate('/');
          }

          if (location.pathname === '/login') {
            setAuth(true);
          }
          else {
            console.log("Checking auth for normal user");
             console.log("User: " + sessionStorage.getItem('username'));
            const res = await apiFetch(`${apiUrl}/checkAuth`);
            const data = await res.json();

            console.log("Auth check:", data);
            setAuth(data.authenticated);
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);


  if (auth === null) {
  // You can return a spinner or a blank screen here
    return <Typography>Checking authentication...</Typography>;
  }


  if (!auth) {
    console.log('Auth value error ', auth);
    return <Navigate to="/login" />;
  }
  return children;
}


async function fetchEventData(eventId) {
  try {
    const res = await apiFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });

    if (res.status === 401) {
      navigate('/login');
      return; // stop execution
    }

    const data = await res.json(); // parse the response

    return data;
  } catch (err) {
    console.error("Error fetching event data:", err);
  }
}