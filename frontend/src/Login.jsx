import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container } from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok)
    {
      sessionStorage.setItem('username', username);  
      navigate('/');      
    } 
    else alert('Login failed');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <h2>Login</h2>
      <TextField fullWidth margin="normal" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
    </Container>
  );
}