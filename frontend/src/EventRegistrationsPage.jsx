import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Box, Typography, Card, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Tab } from '@mui/material';
import Header from './Header';
import Menu from './Controls/Menu';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GDPRNotice from './Controls/GDPRHeader';
import { apiFetch } from './Controls/apiFetch';

const EventRegistrationPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');
  const username = sessionStorage.getItem('username');
  const [parentFilter, setParentFilter] = useState('');
  const [childFilter, setChildFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ParentName', direction: 'asc' });

  useEffect(() => {

    const fetchEvent = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRegistrations(eventId);


    Promise.all([fetchEvent(), fetchRegistrations(eventId)]).finally(() => setLoading(false));
  }, [eventId]);


  const fetchRegistrations = async (eventId) => {
    try {
      const res = await apiFetch(`${apiUrl}/events/${eventId}/registrations`, { credentials: 'include' });
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this signup?')) return;

    try {
      const res = await apiFetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Registration deleted successfully');
        fetchRegistrations(eventId);
      } else {
        const data = await res.json();
        alert(`Failed to delete registration: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the registration');
    }
  };


  const filteredRegistrations = registrations.filter((reg) => {
    const parentMatch = reg.ParentName?.toLowerCase().includes(parentFilter.toLowerCase());
    const childMatch = reg.EventQuestion1Answer?.toLowerCase().includes(childFilter.toLowerCase());
    return parentMatch && childMatch;
  });


  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    const { key, direction } = sortConfig;

    let aValue = a[key] ?? '';
    let bValue = b[key] ?? '';

    if (key === '_ts') {
      aValue = aValue || 0;
      bValue = bValue || 0;
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });


  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const clearFilters = () => {
    setChildFilter("");
    setParentFilter("");
  }

  const markAsAcknowledged = async (registrationId, ts) => {
    // Logic to mark the registration as acknowledged
    if (!window.confirm('Are you sure you want to mark this registration as acknowledged?')) return;

    
    await apiFetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: `{"EmailAckSent" : true, "SignupDateTime": ${ts}}`

    })
      .then(res => res.json())
      .then(() => fetchRegistrations(eventId))
      .catch(err => console.error(err));
      


  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Menu />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>

        <Button className='no-print' variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>Back</Button>

        <GDPRNotice />


        <Typography variant="h5" sx={{ mb: 2 }}>Signups {event ? ` - ${event.EventName}` : ''}</Typography>


        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Filter by Parent Name"
            variant="outlined"
            size="small"
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
          />
          <TextField
            label="Filter by Child Name"
            variant="outlined"
            size="small"
            value={childFilter}
            onChange={(e) => setChildFilter(e.target.value)}
          />

          <Button disabled={!parentFilter && !childFilter} variant="contained" sx={{ mt: 0 }} onClick={() => clearFilters()}>Clear</Button>
        </Box>

        <Table >
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 50 }} className="only-print">Check In/Out</TableCell>

              <TableCell sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: sortConfig.key === 'ParentName' ? '#48a89e' : 'inherit',
                '&:hover': { textDecoration: 'underline' }
              }} onClick={() => handleSort('ParentName')} >
                Parent Details {sortConfig.key === 'ParentName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </TableCell>

              <TableCell>Paid</TableCell>
              <TableCell>Donation Total</TableCell>
              <TableCell>Gift Aid</TableCell>

              <TableCell sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: sortConfig.key === 'ParentName' ? '#48a89e' : 'inherit',
                '&:hover': { textDecoration: 'underline' }
              }} onClick={() => handleSort('EventQuestion1Answer')} >
                {event.EventQuestion1Name} {sortConfig.key === 'EventQuestion1Answer' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </TableCell>




              <TableCell>{event.EventQuestion2Name}</TableCell>
              <TableCell>{event.EventQuestion3Name}</TableCell>
              <TableCell>{event.EventQuestion4Name}</TableCell>
              <TableCell>{event.EventQuestion5Name}</TableCell>
              <TableCell>{event.EventQuestion6Name}</TableCell>
              <TableCell>{event.EventQuestion7Name}</TableCell>
              <TableCell>{event.EventQuestion8Name}</TableCell>
              <TableCell>{event.EventQuestion9Name}</TableCell>
              <TableCell>{event.EventQuestion10Name}</TableCell>

              {/* Other columns... */}

              <TableCell sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: sortConfig.key === 'ParentName' ? '#48a89e' : 'inherit',
                '&:hover': { textDecoration: 'underline' }
              }} onClick={() => handleSort('_ts')} className="no-print">
                Signup Date {sortConfig.key === '_ts' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </TableCell>

              <TableCell className="no-print">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRegistrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className='only-print'><CheckBoxOutlineBlankIcon /><CheckBoxOutlineBlankIcon /></TableCell>
                <TableCell>{reg.ParentName}<br />
                  {reg.ParentEmail}<br />
                  {reg.ParentMobile}</TableCell>
                <TableCell><>{reg.Paid ? <CheckIcon /> : <CloseIcon />}</></TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal || 0).toFixed(2)}</TableCell>
                <TableCell><>{reg.GiftAid ? <CheckIcon /> : <CloseIcon />}</></TableCell>
                <TableCell>{event.EventQuestion1Id == reg.EventQuestion1Name ? reg.EventQuestion1Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion2Id == reg.EventQuestion2Name ? reg.EventQuestion2Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion3Id == reg.EventQuestion3Name ? reg.EventQuestion3Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion4Id == reg.EventQuestion4Name ? reg.EventQuestion4Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion5Id == reg.EventQuestion5Name ? reg.EventQuestion5Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion6Id == reg.EventQuestion6Name ? reg.EventQuestion6Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion7Id == reg.EventQuestion7Name ? reg.EventQuestion7Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion8Id == reg.EventQuestion8Name ? reg.EventQuestion8Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion9Id == reg.EventQuestion9Name ? reg.EventQuestion9Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion10Id == reg.EventQuestion10Name ? reg.EventQuestion10Answer : ""}</TableCell>
                <TableCell className='no-print'>{((d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() % 100} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`)(new Date(reg._ts * 1000))}</TableCell>
                <TableCell className='no-print'>
                  <Button sx={{ mr: 1 }} onClick={() => navigate(`/registrations/${reg.EventName}/edit/${reg.CustomerId}`)}>Edit</Button>
                  {event.EmailAckRequired && (<Button disabled={reg.EmailAckSent} sx={{ mr: 1 }} onClick={() => markAsAcknowledged(reg.CustomerId, reg._ts)}>Acknowledged</Button>)}
                  
                  
                  {username === 'dorsborne@gmail.com' && (<Button onClick={() => handleDelete(reg.CustomerId)}>Delete</Button>)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button className='no-print' variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventRegistrationPage;
