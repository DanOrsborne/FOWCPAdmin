import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Header from './Header';
import Menu from './Menu';
import MD5 from 'crypto-js/md5';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EventFailedPaymentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');
  

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


const failedPaymentChaseLink = (registration) => {
    if (!registration ) {
        return "Invalid request" ;
    }

    if (registration.Paid) {
        return "Already Paid" ;
    }

    if (!registration.DonationAnswer) {
        return "Didn't want to donate";
    }

    if (registration.FailedPaymentChased) {
        return "Failed payment already chased";
    }


    const checksum = MD5(registration.CustomerId + "sfnwe324SDFs!!").toString().toUpperCase();
   
    const paymentLinkURL = `https://fowcpevents20240928105048.azurewebsites.net/api/FOWCPEventSignup_NewPaymentLink?customerid=${registration.CustomerId}&checksum=${checksum}&code=QkuUT2s7dzjoi1OnTR6apSg12tCK0_BvV0k5i7DGXhfHAzFukn6guw%3D%3D`;

    return paymentLinkURL;
}


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
              <TableCell>Donation Answer</TableCell>
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
                <TableCell><>{reg.DonationAnswer ? <CheckIcon/> : <CloseIcon/>}</></TableCell>
                <TableCell><>{reg.Paid ? <CheckIcon/> : <CloseIcon/>}</></TableCell>
                <TableCell>£{parseFloat(reg.DonationTotal || 0).toFixed(2)}</TableCell>
                <TableCell>{reg.failedPaymentChased ? <CheckIcon/> : <CloseIcon/>}</TableCell>
                <TableCell>{reg.SumUpStatus}
                  <br />SumUp Checkout: {reg.CheckoutReference}
                  <br />CustomerId: {reg.CustomerId}
                  <br/> Retry Payment: {failedPaymentChaseLink(reg)} 
                </TableCell>
                <TableCell></TableCell>
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
