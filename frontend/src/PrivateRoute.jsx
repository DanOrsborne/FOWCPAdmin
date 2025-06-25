import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/checkAuth', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAuth(data.authenticated));
  }, []);

  if (auth === null) return null;
  if (!auth) return <Navigate to="/login" />;
  return children;
}