import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';
import { apiFetch } from './Controls/apiFetch';
import GDPRNotice from './Controls/GDPRHeader';

export default function HelperLogin() {
  const { eventcode } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { apiUrl } = require('./Constants');

  const handleLogin = async () => {
    const res = await apiFetch(`${apiUrl}/helperlogin`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventcode, password })
    });

    const data = await res.json();  // 👈 parse the JSON

    console.log("Result:", data);

    if (data != undefined && data.success) {
      alert('Login successful');
      sessionStorage.setItem('eventId', data.eventId);
      sessionStorage.setItem('password', password);
      navigate('/checkin');
    }
    else {
      alert('Login failed');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>

       <GDPRNotice />

      <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>

      <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
    </Container>
  );
}