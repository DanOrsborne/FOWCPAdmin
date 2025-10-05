import React, { useEffect, useState } from 'react';
import {
  Button, TextField, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Box,
  Typography
} from '@mui/material';
import Header from './Header';
import Menu from './Controls/Menu';
import { apiFetch } from './Controls/apiFetch';
import useCurrentUser from './hooks/useCurrentUser'

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({ Password: '', ConfirmPassword: '' });
  const [resettingUser, setResettingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ Email: '', Password: '', Enabled: true, IsAdmin: false });
  const { apiUrl } = require('./Constants');
  const { user, loading } = useCurrentUser();

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`${apiUrl}/users`, { credentials: 'include' });
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
      Enabled: user?.Enabled ?? true,
      IsAdmin: user?.IsAdmin ?? false
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm({ Email: '', Password: '', Enabled: true, IsAdmin: false });
  };

  const handleSubmit = async () => {
    const emailExists = users.some(u =>
      u.Email.toLowerCase() === form.Email.toLowerCase() &&
      u.UserId !== editingUser?.UserId // Only check others
    );

    if (emailExists) {
      alert("A user with this email already exists.");
      return;
    }

    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${apiUrl}/users/${editingUser.UserId}` : `${apiUrl}/users`;

      // Build body conditionally
      const body = {
        Email: form.Email,
        Enabled: form.Enabled,
        IsAdmin: form.IsAdmin,
        ...(!editingUser && { Password: form.Password }) // Only include password when creating
      };


      console.log("Submitting user data:", body);
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Request failed');

      fetchUsers();
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save user");
    }
  };


  const handleOpenResetDialog = (user) => {
    setResettingUser(user);
    setResetPasswordForm({ Password: '', ConfirmPassword: '' });
    setResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResettingUser(null);
  };

  const handlePasswordReset = async () => {
    if (resetPasswordForm.Password !== resetPasswordForm.ConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await apiFetch(`${apiUrl}/users/${resettingUser.UserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Password: resetPasswordForm.Password })
      });

      if (!res.ok) throw new Error('Failed to reset password');
      alert('Password reset successfully.');
      handleCloseResetDialog();
    } catch (err) {
      console.error(err);
      alert("Password reset failed");
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await apiFetch(`${apiUrl}/users/${id}`, {
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

<>






    <Box sx={{ display: 'flex' }}>
      <Header />

      <Menu />
      <Box component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>


        <Typography variant="h5" sx={{ mb: 2 }}>Users</Typography>

        { !user?.IsAdmin && (<Typography variant="h5" sx={{ mb: 2 }}>Not available for this user</Typography>) }
        {user?.IsAdmin && (<>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add User
        </Button>

        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Is Admin?</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.Email}</TableCell>
                  <TableCell>{u.Enabled ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{u.IsAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button sx={{ mr: 1 }} onClick={() => handleOpen(u)}>Edit</Button>
                    <Button sx={{ mr: 1 }} onClick={() => handleOpenResetDialog(u)}>Reset Password</Button>
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
            <TextField autoComplete={false}
              label="Email"
              fullWidth
              margin="dense"
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
            />

            {!editingUser && (
              <TextField autoComplete={false}
                label="Password"
                type="password"
                fullWidth
                margin="dense"
                value={form.Password}
                onChange={(e) => setForm({ ...form, Password: e.target.value })}
              />
            )}


            <FormControlLabel
              control={
                <Switch
                  checked={form.Enabled}
                  onChange={(e) => setForm({ ...form, Enabled: e.target.checked })}
                />
              }
              label="Enabled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.IsAdmin}
                  onChange={(e) => setForm({ ...form, IsAdmin: e.target.checked })}
                />
              }
              label="Is Admin?"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog}>
          <DialogTitle>Reset Password for {resettingUser?.Email}</DialogTitle>
          <DialogContent>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="dense"
              value={resetPasswordForm.Password}
              onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, Password: e.target.value })}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="dense"
              value={resetPasswordForm.ConfirmPassword}
              onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, ConfirmPassword: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetDialog}>Cancel</Button>
            <Button onClick={handlePasswordReset} variant="contained" color="primary">Reset</Button>
          </DialogActions>
        </Dialog>

              </>)}

      </Box></Box>

</>
  );
}
