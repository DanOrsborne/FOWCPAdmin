import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Tab } from '@mui/material';
import Header from './Header';
import Menu from './Menu';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GDPRNotice from './Controls/GDPRHeader';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { TextField } from '@mui/material'; // ADD THIS to your imports


const EventCheckInPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');


  // Inside your component:
  const [parentFilter, setParentFilter] = useState('');
  const [childFilter, setChildFilter] = useState('');



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
    
    fetchRegistrations(eventId);


    Promise.all([fetchEvent(), fetchRegistrations(eventId)]).finally(() => setLoading(false));
  }, [eventId]);



const fetchRegistrations = async (eventId) => {
  try {
    const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, { credentials: 'include' });
    const data = await res.json();
    setRegistrations(data);
  } catch (err) {
    console.error(err);
  }
};

 
const handleCheckInOut = async (registrationId, action, value, warn, isCheckedIn) => {

  let actionName = "";
  if (action === "checkedIn" ) {
    actionName = "Check In";

  }
  else if (action === "checkedOut") {
    actionName = "Check Out";
    if(!isCheckedIn && value) 
      {
        window.alert("You cannot check out a person who is not checked in");
    return;
      }
  }

  if(warn) {
    if (!window.confirm(`Are you sure you want to remove this persons ${actionName}?`)) return;

  }

    let jsonData = `{"${action}" : ${value}}`;

    await fetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: jsonData
    })
      .then(res => res.json()) 
      .catch(err => console.error(err));
    

    await fetchRegistrations(eventId);
  };

  const clearFilters = () => {
    setChildFilter("");
    setParentFilter("");
  }
  


  
const filteredRegistrations = registrations.filter((reg) => {
  const parentMatch = reg.ParentName?.toLowerCase().includes(parentFilter.toLowerCase());
  const childMatch = reg.EventQuestion1Answer?.toLowerCase().includes(childFilter.toLowerCase());
  return parentMatch && childMatch;
});


  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ display: 'flex' }}>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>

      <Button className='no-print' variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>Back</Button>

      <GDPRNotice/>

         <Typography variant="h5" sx={{ mb: 2 }}>Check In {event ? ` - ${event.EventName}` : ''}</Typography>



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
              <TableCell sx={{minWidth:50}} >Check In/Out</TableCell>
              <TableCell>Parent Details</TableCell>
            
              <TableCell>{event.EventQuestion1Name}</TableCell>
              <TableCell>{event.EventQuestion2Name}</TableCell>
              <TableCell>{event.EventQuestion3Name}</TableCell>
              <TableCell>{event.EventQuestion4Name}</TableCell>
              <TableCell>{event.EventQuestion5Name}</TableCell>
              <TableCell>{event.EventQuestion6Name}</TableCell>
              <TableCell>{event.EventQuestion7Name}</TableCell>
              <TableCell>{event.EventQuestion8Name}</TableCell>
              <TableCell>{event.EventQuestion9Name}</TableCell>
              <TableCell>{event.EventQuestion10Name}</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistrations.sort((a, b) => a.EventQuestion1Answer.localeCompare(b.EventQuestion1Answer)).map((reg) => (
              <TableRow key={reg.id}>
                <TableCell ><>{reg.checkedIn ? <CheckBoxIcon sx={{color:'green'}}  onClick={() => handleCheckInOut(reg.CustomerId, "checkedIn", false, true)} />
                : <CheckBoxOutlineBlankIcon onClick={() => handleCheckInOut(reg.CustomerId, "checkedIn", true, false)} />}
                  {reg.checkedOut ? <DisabledByDefaultIcon sx={{color:'red'}}  onClick={() => handleCheckInOut(reg.CustomerId, "checkedOut", false, true)} />
                : <CheckBoxOutlineBlankIcon onClick={() => handleCheckInOut(reg.CustomerId, "checkedOut", true, false, reg.checkedIn )} />}</>
                  </TableCell>
                <TableCell>{reg.ParentName}<br/>
                {reg.ParentEmail}<br/>
                {reg.ParentMobile}</TableCell>
              
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
                
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button className='no-print' variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default EventCheckInPage;
