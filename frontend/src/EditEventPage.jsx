import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Checkbox, FormControlLabel, Button, MenuItem, Typography, Grid } from '@mui/material';
import dayjs from 'dayjs';

import Header from './Header';
import Menu from './Menu';
import TextInputField from './Controls/TextInputField';
import TextAreaInputField from './Controls/TextAreaInputField';
import CheckBoxInputField from './Controls/CheckBoxInputField';
import { apiFetch } from './Controls/apiFetch';

export default function EditEventPage({ isNew }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const { apiUrl } = require('./Constants');


  const qrUrl = `${apiUrl}/events/${eventId}/qr`;

  async function fetchEventData(eventId) {
    await apiFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) navigate('/login');
        return res.json();
      })
      .then(data => setEventData(data))
      .catch(err => console.error(err));
  }


  useEffect(() => {
    if (!isNew && eventId) {
      fetchEventData(eventId)
    }
    else {
      setEventData(null);
    }
  }, [eventId, isNew, navigate]);


  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, subfield, value) => {
    setEventData(prev => ({
      ...prev,
      [`EventQuestion${index}${subfield}`]: value
    }));
  };

  const handleBack = () => {
    navigate('/');
  }

  const handleCreateShortUrl = async () => {
    try {
      const res = await apiFetch(`${apiUrl}/events/${eventId}/createshorturl`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Short URL created`);
        fetchEventData(eventId)
      } else {
        alert('Failed to create short URL');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating short URL');
    }
  };

  const handleSave = async () => {

    if (isNew) {
      await apiFetch(`${apiUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      })
        .then(res => res.json())

        .catch(err => console.error(err));

    } else {

      await apiFetch(`${apiUrl}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      })
        .then(res => res.json())
        .catch(err => console.error(err));
    }

    navigate('/');
  };

  if (!eventData && !isNew) return <div>Loading...</div>;

  return (


    <Box sx={{ display: 'flex' }}>
      <Header />

      <Menu />
      <Box component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>





        <Typography variant="h5" sx={{ mb: 2 }}>{isNew ? "Add" : "Edit"} Event {eventData && !isNew ? ` - ${eventData.EventName}` : ''}</Typography>


        <TextInputField
          label="Event Name"
          value={eventData != null && eventData.EventName}
          onChange={val => handleChange('EventName', val)}
        />


        <TextAreaInputField
          label="Event Description"
          value={eventData != null && eventData.EventDescription || ''}
          onChange={val => handleChange('EventDescription', val)}
        />

        <TextAreaInputField
          label="Terms & Conditions"
          value={eventData != null && eventData.TermsAndConditions || ''}
          onChange={val => handleChange('TermsAndConditions', val)}
        />

        {!isNew && <TextField
          label="ShortUrl"
          value={eventData != null && eventData.ShortUrl}
          disabled={true}
        />} {!isNew && !eventData.ShortUrl && <Button variant='contained' onClick={handleCreateShortUrl}> Create Short URL </Button>}


        {!isNew && eventData.ShortUrl && <img src={qrUrl} alt="QR Code" />}

        <CheckBoxInputField
          label="Event Active?"
          value={eventData != null && eventData.Active || false}
          onChange={val => handleChange('Active', val)}
        />


        <CheckBoxInputField
          label="Multi Ticket Event?"
          value={eventData != null && eventData.MultiTicketEvent || false}
          onChange={val => handleChange('MultiTicketEvent', val)}
        />

        {eventData != null && eventData.MultiTicketEvent && (<TextInputField
          label="Max Tickets"
          value={(eventData != null && eventData.MaxTickets || '')}
          onChange={val => handleChange('MaxTickets', val)}
          type="number"
        />)}



        <TextInputField
          label="Event Donation (£)"
          value={(eventData != null && eventData.EventDonation || '').replace('£', '')}
          onChange={val => handleChange('EventDonation', `£${val}`)}
          type="number"
        />


        <TextInputField
          label="Event Date & Time"
          value={dayjs(eventData != null && eventData.EventDateTime).format('YYYY-MM-DDTHH:mm')}
          onChange={val => handleChange('EventDateTime', val)}
          type="datetime-local"
        />


        <CheckBoxInputField
          label="Hide Allergy Question?"
          value={eventData != null && eventData.HideAllergyQuestion || false}
          onChange={val => handleChange('HideAllergyQuestion', val)}
        />



        <CheckBoxInputField
          label="Hide No Donation?"
          value={eventData != null && eventData.HideNoDonation || false}
          onChange={val => handleChange('HideNoDonation', val)}
        />


        <TextInputField
          label="Call to Action Text"
          value={(eventData != null && eventData.CTAText || 'Register')}
          onChange={val => handleChange('CTAText', val)}

        />







        <Typography variant="h6" style={{ marginTop: 20 }}>Event Questions</Typography>

        {Array.from({ length: 10 }).map((_, i) => {
          const index = i + 1;
          return (
            <Grid container spacing={2} key={index} style={{ marginTop: 10, marginBottom: 20 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  label={`Question ${index} Name`}
                  value={eventData != null && eventData[`EventQuestion${index}Name`] || ''}
                  onChange={e => handleQuestionChange(index, 'Name', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Id"
                  value={eventData != null && eventData[`EventQuestion${index}Id`] || ''}
                  onChange={e => handleQuestionChange(index, 'Id', e.target.value)}
                  fullWidth

                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Type"
                  value={eventData != null && eventData[`EventQuestion${index}Type`] || ''}
                  onChange={e => handleQuestionChange(index, 'Type', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Text">Text</MenuItem>
                  <MenuItem value="Options">Options</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                {eventData != null && eventData[`EventQuestion${index}Type`] === 'Options' && (
                  <TextField
                    label="Options (| delimited)"
                    value={eventData != null ? eventData[`EventQuestion${index}Options`] || '' : ""}
                    onChange={e => handleQuestionChange(index, 'Options', e.target.value)}
                    fullWidth
                  />
                )}
              </Grid>
            </Grid>
          );
        })}
        <Button variant="contained" sx={{ marginRight: 1 }} onClick={handleSave}>Save</Button>

        <Button variant="outlined" onClick={handleBack}>Back</Button>
      </Box>
    </Box>
  );
}
