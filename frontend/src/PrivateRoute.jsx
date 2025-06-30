import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from './Controls/apiFetch';
const { apiUrl } = require('./Constants');

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/checkAuth`);
        const data = await res.json();
        setAuth(data.authenticated);
      } catch (err) {
        console.error('Auth check failed', err);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return null;
  if (!auth) return <Navigate to="/login" />;
  return children;
}
