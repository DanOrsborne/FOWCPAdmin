import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Button, MenuItem } from '@mui/material';
import Header from './Header';
import Menu from './Menu';
import TextInputField from './Controls/TextInputField';
import TextAreaInputField from './Controls/TextAreaInputField';
import CheckBoxInputField from './Controls/CheckBoxInputField';
import { apiFetch } from './Controls/apiFetch';

export default function EditRegistration() {
  const { eventId, registrationId } = useParams();
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState(null);
  const { apiUrl } = require('./Constants');

  useEffect(async () => {
    await apiFetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) navigate('/login');
        return res.json();
      })
      .then(data => setRegistrationData(data))
      .catch(err => console.error(err));
  }, [eventId, registrationId, navigate]);

  const handleChange = (field, value) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, subfield, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [`EventQuestion${index}${subfield}`]: value
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    await apiFetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(registrationData)
    })
      .then(res => res.json())
      .then(() => navigate(-1))
      .catch(err => console.error(err));
  };

  if (!registrationData) return <div>Loading...</div>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Menu />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Edit Signup</Typography>

        <TextInputField
          label="Parent Name"
          value={registrationData.ParentName || ''}
          onChange={val => handleChange('ParentName', val)}
        />

        <TextInputField
          label="Parent Email"
          value={registrationData.ParentEmail || ''}
          onChange={val => handleChange('ParentEmail', val)}
        />

        <TextInputField
          label="Parent Mobile"
          value={registrationData.ParentMobile || ''}
          onChange={val => handleChange('ParentMobile', val)}
        />

        <CheckBoxInputField
          label="Paid?"
          value={registrationData.Paid || false}
          onChange={val => handleChange('Paid', val)}
        />

        <TextInputField
          label="Donation Total (£)"
          value={registrationData.DonationTotal || ''}
          onChange={val => handleChange('DonationTotal', val)}
          type="number"
        />

        <CheckBoxInputField
          label="Gift Aid?"
          value={registrationData.GiftAid || false}
          onChange={val => handleChange('GiftAid', val)}
        />

        <TextInputField
          label="Gift Aid Address"
          value={registrationData.GiftAidAddress || ''}
          onChange={val => handleChange('GiftAidAddress', val)}
        />

        <TextInputField
          label="Allergies"
          value={registrationData.Allergies || ''}
          onChange={val => handleChange('Allergies', val)}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>Event Questions</Typography>

        {Array.from({ length: 10 }).map((_, i) => {
          const index = i + 1;
          return (
            <Grid container spacing={2} key={index} sx={{ mt: 1, mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  label={`Question ${index} Name`}
                  value={registrationData[`EventQuestion${index}Name`] || ''}
                  onChange={e => handleQuestionChange(index, 'Name', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Answer"
                  value={registrationData[`EventQuestion${index}Answer`] || ''}
                  onChange={e => handleQuestionChange(index, 'Answer', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          );
        })}

        <Button variant="contained" sx={{ mr: 1 }} onClick={handleSave}>Save</Button>
        <Button variant="outlined" onClick={handleBack}>Back</Button>
      </Box>
    </Box>
  );
}
