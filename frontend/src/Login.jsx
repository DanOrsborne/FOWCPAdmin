import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';
import { apiFetch } from './Controls/apiFetch';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { apiUrl } = require('./Constants');

  const handleLogin = async () => {
    const res = await apiFetch(`${apiUrl}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      sessionStorage.setItem('username', username);
      navigate('/');
    }
    else alert('Login failed');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
      <TextField fullWidth margin="normal" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
    </Container>
  );
}