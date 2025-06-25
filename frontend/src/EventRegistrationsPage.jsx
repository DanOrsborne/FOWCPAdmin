import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Header from './Header';
import Menu from './Menu';

const { apiUrl } = require('./Constants');

const EventSummaryPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchEvent = async () => {
      try {
        const res = await fetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, { credentials: 'include' });
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchEvent(), fetchRegistrations()]).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Menu />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>
         <Typography variant="h5" sx={{ mb: 2 }}>Signups {event ? ` - ${event.EventName}` : ''}</Typography>

        <Table >
          <TableHead>
            <TableRow>
              <TableCell>Parent Details</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Donation Total</TableCell>
              <TableCell>Gift Aid</TableCell>
              <TableCell>{event.EventQuestion1Name}</TableCell>
              <TableCell>{event.EventQuestion2Name}</TableCell>
              <TableCell>{event.EventQuestion3Name}</TableCell>
              <TableCell>{event.EventQuestion4Name}</TableCell>
               <TableCell>Checkout Reference</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>{reg.ParentName}<br/>
                {reg.ParentEmail}<br/>
                {reg.ParentMobile}</TableCell>
                <TableCell>{reg.Paid ? 'Yes' : 'No'}</TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal || 0).toFixed(2)}</TableCell>
                <TableCell>{reg.GiftAid ? 'Yes' : 'No'}</TableCell>
                <TableCell>{event.EventQuestion1Id == reg.EventQuestion1Name ? reg.EventQuestion1Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion2Id == reg.EventQuestion2Name ? reg.EventQuestion2Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion3Id == reg.EventQuestion3Name ? reg.EventQuestion3Answer : ""}</TableCell>
                <TableCell>{event.EventQuestion4Id == reg.EventQuestion4Name ? reg.EventQuestion4Answer : ""}</TableCell>
                 <TableCell>{reg.CheckoutReference}</TableCell>
                <TableCell><Button onClick={() => navigate(`/registrations/${reg.EventName}/edit/${reg.CustomerId}`)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventSummaryPage;
