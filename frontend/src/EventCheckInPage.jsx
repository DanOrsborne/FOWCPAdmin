import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Checkbox, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Tab, Select, MenuItem, ButtonGroup } from '@mui/material';
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
import CheckInOutToggle from './Controls/CheckInOutToggle';

const EventCheckInPage = () => {
  const { eventId: paramEventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = require('./Constants');
  const [parentFilter, setParentFilter] = useState('');
  const [childFilter, setChildFilter] = useState('');
  const [classFilter, setClassFilter] = useState(['All']);
  const [loadingId, setLoadingId] = useState(null);

  const [eventId, setEventId] = useState(() => {
    // Initial state: from param, then fallback to sessionStorage
    return paramEventId || sessionStorage.getItem('eventId') || null;
  });

  const fromSessionStorage = !paramEventId;

  useEffect(() => {

    //console.log("Event ID:", eventId);
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
  }, [eventId, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRegistrations(eventId);
    }, 5000); // every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
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


  const handleCheckInOut = async (registrationId, action, value, warn, isCheckedIn) => {

    let actionName = "";
    if (action === "checkedIn") {
      actionName = "Check In";

    }
    else if (action === "checkedOut") {
      actionName = "Check Out";
      if (!isCheckedIn && value) {
        window.alert("You cannot check out a person who is not checked in");
        return;
      }
    }

    if (warn) {
      if (!window.confirm(`Are you sure you want to remove this persons ${actionName}?`)) return;

    }

    setLoadingId(registrationId); // 🔄 Set spinner

    let jsonData = `{"${action}" : ${value}}`;

    try {
      await apiFetch(`${apiUrl}/events/${eventId}/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: jsonData
      })
        .then(res => res.json())
        .catch(err => console.error(err));


      await fetchRegistrations(eventId);
    }
    catch (err) {
      console.error(err);
    }
    finally {
      setLoadingId(null); // ✅ Clear spinner
    };
  }

  const clearFilters = () => {
    setChildFilter("");
    setParentFilter("");
    setClassFilter(['All']);
  };

  const handleHelperLogout = async () => {
    sessionStorage.removeItem('eventId');
    sessionStorage.removeItem('password');
    navigate('/login');
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const parentMatch = reg.ParentName?.toLowerCase().includes(parentFilter.toLowerCase());
    const childMatch = reg.EventQuestion1Answer?.toLowerCase().includes(childFilter.toLowerCase());

    const classMatch =
      classFilter.includes("All") || classFilter.length === 0 ||
      classFilter.includes(reg.EventQuestion2Answer);

    return parentMatch && childMatch && classMatch;
  });


  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ display: 'flex' }}>

      <Box className='noMT' component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 6 }}>


        {!fromSessionStorage && <Button className='no-print' variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>Back</Button>}
        {fromSessionStorage && <Button className='no-print' variant="contained" sx={{ mb: 3 }} onClick={() => handleHelperLogout()}>Logout</Button>}
        {!fromSessionStorage && <Button className='no-print' variant="contained" sx={{ ml: 1, mb: 3 }} onClick={() => navigate(`/checkin/${eventId}/helperlogin`)}>Share Helper Login</Button>}


        <GDPRNotice />



        <Typography variant="h5" sx={{ mb: 2 }}>Check In {event ? ` - ${event.EventName}` : ''}</Typography>

        {!event.Active && (<Typography variant="h5" sx={{ mb: 2 }}>Not available for inactive events</Typography>)}
        {!event.NeedsCheckIn && (<Typography variant="h5" sx={{ mb: 2 }}>Check In not enabled for this event</Typography>)}

        {event.Active && event.NeedsCheckIn && (<>
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

            <Select
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // Allow scrollable menu
                    overflowY: 'auto',
                  },
                },
                // Helps with placement on small screens
                getContentAnchorEl: null,
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              multiple
              value={classFilter}
              onChange={(e) => {
                const value = e.target.value;

                // If "All" was just selected
                if (value.includes("All") && !classFilter.includes("All")) {
                  setClassFilter(["All"]);
                  return;
                }

                // If "All" is currently selected and user selects something else, remove "All"
                if (classFilter.includes("All")) {
                  setClassFilter(value.filter(v => v !== "All"));
                } else {
                  setClassFilter(value);
                }
              }}
              size="small"
              renderValue={(selected) => selected.includes("All") || selected.length === 0 ? "All" : selected.join(', ')}
            >
              <MenuItem value="All">
                <Checkbox checked={classFilter.includes("All") || classFilter.length === 0} />
                All
              </MenuItem>

              {[...new Set(registrations.map((reg) => reg.EventQuestion2Answer).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b))
                .map((className, idx) => (
                  <MenuItem key={idx} value={className}>
                    <Checkbox checked={classFilter.includes(className)} />
                    {className}
                  </MenuItem>
                ))}
            </Select>

            <Button disabled={
              !parentFilter &&
              !childFilter &&
              (!classFilter || classFilter === "*") // disable if empty or "*"
            } variant="contained" sx={{ mt: 0 }} onClick={() => clearFilters()}>Clear</Button>
          </Box>

          <Table >
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 50 }} >Check In/Out</TableCell>
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
                  <TableCell >


                    <CheckInOutToggle
                      reg={reg}
                      loadingId={loadingId}
                      handleCheckInOut={handleCheckInOut}
                    />

                  </TableCell>
                  <TableCell>{reg.ParentName}<br />
                    {reg.ParentEmail}<br />
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
          </Table></>
        )}

        {!fromSessionStorage && <Button className='no-print' variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>}
      </Box>
    </Box>
  );
};

export default EventCheckInPage;
