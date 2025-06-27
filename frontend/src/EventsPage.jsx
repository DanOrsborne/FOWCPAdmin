import { useEffect, useState } from 'react';
import { Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';

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
    const res = await fetch(`${apiUrl}/events`, {
      credentials: 'include'
    });
    const data = await res.json();
    const filtered = filter === 'active' ? data.filter(e => e.Active) : data;
    setEvents(filtered);
  };


  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?  This will delete any associated signups and gift aid information for this event')) return;

    try {
      const res = await fetch(`${apiUrl}/events/${eventId}`, {
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

  return (



     <Box sx={{ display: 'flex' }}>
      <Header />
    
        <Menu/>
        <Box  component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>
          
         
      <Typography variant="h5" sx={{  mb: 2 }}>Events</Typography>
      <Select value={filter} onChange={e => setFilter(e.target.value)}>
        <MenuItem value="active">Active Only</MenuItem>
        <MenuItem value="all">All Events</MenuItem>
      </Select>
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
                <Button onClick={() => navigate(`/edit/${e.EventId}`)}>Edit</Button>
                <Button onClick={() => navigate(`https://fowcpevents20240928105048.azurewebsites.net/api/FOWCPEventSignup?code=2R7-QJayuS3kFRIhlH2N-FhF0xSCQIKgLrotyAAEBHgsAzFuw1G4hQ==&eventid=${e.EventId}`)}>View</Button>
                <Button onClick={() => navigate(`/summary/${e.EventId}`)}>Summary</Button>
                <Button onClick={() => navigate(`/registrations/${e.EventId}`)}>Signups</Button>
                <Button onClick={() => navigate(`/giftaid/${e.EventId}`)}>Gift Aid</Button>
                <Button onClick={() => navigate(`/failedpayments/${e.EventId}`)}>Failed Payments</Button>
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