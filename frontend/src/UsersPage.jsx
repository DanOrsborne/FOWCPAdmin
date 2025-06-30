import React, { useEffect, useState } from 'react';
import {
  Button, TextField, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Box,
  Typography
} from '@mui/material';
import Header from './Header';
import Menu from './Menu';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ Email: '', Password: '', Enabled: true });
  const { apiUrl } = require('./Constants');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setForm({
      Email: user?.Email || '',
      Password: '',
      Enabled: user?.Enabled ?? true
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm({ Email: '', Password: '', Enabled: true });
  };

  const handleSubmit = async () => {
  const emailExists = users.some(u =>
    u.Email.toLowerCase() === form.Email.toLowerCase() &&
    (!editingUser || u.id !== editingUser.id)
  );

  if (emailExists) {
    alert("A user with this email already exists.");
    return;
  }

  try {
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `${apiUrl}/users/${editingUser.id}` : `${apiUrl}/users`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });

    if (!res.ok) throw new Error('Request failed');

    fetchUsers();
    handleClose();
  } catch (err) {
    console.error(err);
    alert("Failed to save user");
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  return (
 
     <Box sx={{ display: 'flex' }}>
      <Header />
    
        <Menu/>
        <Box  component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>
          
         
      <Typography variant="h5" sx={{  mb: 2 }}>Users</Typography>



      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add User
      </Button>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.Email}</TableCell>
                <TableCell>{u.Enabled ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button  sx={{mr:1}} onClick={() => handleOpen(u)}>Edit</Button>
                  <Button color="error" onClick={() => handleDelete(u.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField  autoComplete={false}
            label="Email"
            fullWidth
            margin="dense"
            value={form.Email}
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
          />
          <TextField autoComplete={false}
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.Enabled}
                onChange={(e) => setForm({ ...form, Enabled: e.target.checked })}
              />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box></Box>
  );
}
