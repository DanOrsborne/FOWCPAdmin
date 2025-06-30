import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import Header from './Header';
import Menu from './Menu';
import { apiFetch } from './Controls/apiFetch';

const EventSummaryPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
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


    const fetchSummary = async () => {

      try {
        const res = await apiFetch(`${apiUrl}/events/${eventId}/summary`, {
          credentials: 'include'
        });
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([fetchEvent(), fetchSummary()]).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />

      <Menu />
      <Box component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>

        <Typography variant="h5" sx={{ mb: 2 }}>Event Summary {event ? ` - ${event.EventName}` : ''}</Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Total Registrations: {summary?.TotalRegistrations}</Typography>
            <Typography>Paid Registrations: {summary?.PaidRegistrations}</Typography>
            <Typography>Gift Aid Registrations: {summary?.GiftAidRegistrations}</Typography>
            <Typography>Total Paid: £{summary?.TotalPaid?.toFixed(2)}</Typography>
            <Typography>Gift Aid Total: £{summary?.GiftAidTotal?.toFixed(2)}</Typography>
            {summary?.TotalNumberOfTickets > 0 && <Typography>Total Number of Tickets: {summary?.TotalNumberOfTickets}</Typography>}
          </CardContent>
        </Card>

        <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
      </Box></Box>
  );
};

export default EventSummaryPage;