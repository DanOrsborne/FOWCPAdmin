import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Tab, Select, MenuItem, ButtonGroup } from '@mui/material';
import Header from './Header';
import Menu from './Controls/Menu';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GDPRNotice from './Controls/GDPRHeader';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { TextField } from '@mui/material'; // ADD THIS to your imports
import { apiFetch } from './Controls/apiFetch';

const EventCheckInPageHelperLogin = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');


  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {

    console.log("Event ID:", eventId);
    const fetchEvent = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
        const data = await res.json();
        setEvent(data);

        setQrUrl(`${apiUrl}/events/${eventId}/helperlogin`);

      } catch (err) {
        console.error(err);
      }
    };




    Promise.all([fetchEvent()]).finally(() => setLoading(false));
  }, [eventId, navigate]);







  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ display: 'flex' }}>

      <Box className='noMT' component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>


        <Button className='no-print' variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>Back</Button>
        <GDPRNotice />



        <Typography variant="h5" sx={{ mb: 2 }}>Helper Login {event ? ` - ${event.EventName}` : ''}</Typography>

        {event.Active && event.NeedsCheckIn && (

          <Box alignContent={"center"}>
            <img src={qrUrl} alt="QR Code" />

            <Typography variant="h3" sx={{ mb: 2 }}>Password: {`${event.EventPassword}`}</Typography>
          </Box>
        )}


        {!event.Active || !event.NeedsCheckIn && (<Typography variant="h5" sx={{ mb: 2 }}>Not available for this event</Typography>)}
        <Button className='no-print' variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventCheckInPageHelperLogin;
