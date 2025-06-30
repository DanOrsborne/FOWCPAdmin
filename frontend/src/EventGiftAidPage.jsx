import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Header from './Header';
import Menu from './Menu';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import GDPRNotice from './Controls/GDPRHeader';
import { apiFetch } from './Controls/apiFetch';

const EventGiftAidPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');

  useEffect(() => {

    const fetchEvent = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/events/${eventId}/registrations`, { credentials: 'include' });
        const data = await res.json();

        const filtered = data.filter(e => e.GiftAid);

        setRegistrations(filtered);
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
        <Typography variant="h5" sx={{ mb: 2 }}>Gift Aid {event ? ` - ${event.EventName}` : ''}</Typography>

        <GDPRNotice />

        <Table >
          <TableHead>
            <TableRow>
              <TableCell>Parent Details</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Donation Total</TableCell>
              <TableCell>Gift Aid</TableCell>
              <TableCell>Gift Aid Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>{reg.ParentName}<br />
                  {reg.ParentEmail}<br />
                  {reg.ParentMobile}</TableCell>
                <TableCell>{reg.GiftAidAddress}</TableCell>
                <TableCell><>{reg.GiftAid ? <CheckIcon /> : <CloseIcon />}</></TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal || 0).toFixed(2)}</TableCell>
                <TableCell>{reg.GiftAid ? <CheckIcon /> : <CloseIcon />}</TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal * 0.2 || 0).toFixed(2)}</TableCell>


              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventGiftAidPage;
