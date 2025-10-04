import { useEffect, useState } from 'react';
import { Typography, FormControl, Container, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import { apiFetch } from './Controls/apiFetch';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('active');
  const navigate = useNavigate();
  const { apiUrl } = require('./Constants');
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    const res = await apiFetch(`${apiUrl}/events`, {
      credentials: 'include'
    });
    const data = await res.json();
    const filtered = filter === 'active' ? data.filter(e => e.Active) : data;
    setEvents(filtered);
  };


  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?  This will delete any associated signups and gift aid information for this event')) return;

    try {
      const res = await apiFetch(`${apiUrl}/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Event deleted successfully');
        fetchEvents();
      } else {
        const data = await res.json();
        alert(`Failed to delete event: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the event');
    }
  };


  const handleAddEvent = (user = null) => {
    navigate('/add-event')
  };

  return (



    <Box sx={{ display: 'flex' }}>
      <Header />

      <Menu />
      <Box component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>


        <Typography variant="h5" sx={{ mb: 2 }}>Events</Typography>


        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Button variant="contained" color="primary" onClick={handleAddEvent}>
            ADD EVENT
          </Button>

          <FormControl variant="outlined" size="small">
            <Select value={filter} onChange={e => setFilter(e.target.value)}>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="all">All Events</MenuItem>
            </Select>
          </FormControl>
        </div>


        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.EventName}</TableCell>
                <TableCell>{e.EventDateTime}</TableCell>
                <TableCell>{e.Active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/edit/${e.EventId}`)}>Edit</Button>
                  <Button sx={{ mr: 1 }} target='_blank' onClick={() =>
                    window.open(`https://fowcpevents20240928105048.azurewebsites.net/api/FOWCPEventSignup?code=2R7-QJayuS3kFRIhlH2N-FhF0xSCQIKgLrotyAAEBHgsAzFuw1G4hQ==&eventid=${e.EventId}`, '_blank')}>View</Button>
                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/summary/${e.EventId}`)}>Summary</Button>

                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/registrations/${e.EventId}`)}>Signups</Button>
                  {e.Active && e.NeedsCheckIn && (<Button sx={{ mr: 1 }} onClick={() => navigate(`/checkin/${e.EventId}`)}>Check In</Button>)}
                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/giftaid/${e.EventId}`)}>Gift Aid</Button>
                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/failedpayments/${e.EventId}`)}>Failed Payments</Button>
                  {username === 'dorsborne@gmail.com' && (<Button onClick={() => handleDelete(e.EventId)}>Delete</Button>)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>

  );
}