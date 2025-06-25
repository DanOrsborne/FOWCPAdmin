import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Header from './Header';
import Menu from './Menu';

const { apiUrl } = require('./Constants');

const EventFailedPaymentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchEvent = async () => {
      try {
        const res = await fetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
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
        const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, { credentials: 'include' });
        const data = await res.json();

        const filtered = data.filter(e => e.DonationAnswer && !e.Paid);

        const updated = await Promise.all(filtered.map(async (reg) => {
          if (reg.CheckoutReference) {
            try {
              const sumupRes = await fetch(`${apiUrl}/registrations/${reg.id}/sumup`, { credentials: 'include' });
              if (sumupRes.ok) {
                const sumupData = await sumupRes.json();
                return { ...reg, SumUpStatus: sumupData.status || 'N/A' };
              }
            } catch (err) {
              console.error(`Failed SumUp fetch for ${reg.id}`, err);
            }
          }
          return { ...reg, SumUpStatus: 'N/A' };
        }));

        setRegistrations(updated);
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
        <Typography variant="h5" sx={{ mb: 2 }}>
          Failed Payments {event ? ` - ${event.EventName}` : ''}
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parent Details</TableCell>
              <TableCell>DonationAnswer</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Donation Total</TableCell>
              <TableCell>Payment Chased</TableCell>
              <TableCell>SumUp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  {reg.ParentName}<br />
                  {reg.ParentEmail}<br />
                  {reg.ParentMobile}
                </TableCell>
                <TableCell>{reg.DonationAnswer ? 'Yes' : 'No'}</TableCell>
                <TableCell>{reg.Paid ? 'Yes' : 'No'}</TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal || 0).toFixed(2)}</TableCell>
                <TableCell>{reg.failedPaymentChased ? 'Yes' : 'No'}</TableCell>
                <TableCell>{reg.SumUpStatus}<br />{reg.CheckoutReference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventFailedPaymentPage;
