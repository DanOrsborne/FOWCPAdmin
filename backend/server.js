require('dotenv').config();

const { client,  databaseName,  registrationsDB,  usersDB,    eventsDB } = require('./cosmos');
const axios = require('axios');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const path = require('path');
const PORT = process.env.PORT;
const SUMUP_API_KEY =  process.env.SUMUP_API_KEY
const BITLY_API_KEY = process.env.BITLY_API_KEY;
const { v4: uuidv4 } = require('uuid');
const longUrl = `https://fowcpevents20240928105048.azurewebsites.net/api/FOWCPEventSignup?code=2R7-QJayuS3kFRIhlH2N-FhF0xSCQIKgLrotyAAEBHgsAzFuw1G4hQ==&eventid=`;



const eventsContainer = client.database(databaseName).container(eventsDB);
const usersContainer = client.database(databaseName).container(usersDB);
const registrationsContainer = client.database(databaseName).container(registrationsDB);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace_this_secret',
  resave: false,
  saveUninitialized: true,
}));

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.Email = @username',
      parameters: [
        { name: '@username', value: username }
      ]
    };

    const { resources } = await usersContainer.items.query(querySpec).fetchAll();

    if (resources.length > 0) {
      const user = resources[0];
      const dbPassword = user.Password;
      const hashedInput = crypto.createHash('md5').update(password + process.env.PASSWORD_HASH_SALT).digest('hex'); //https://www.md5.cz/
      //console.log(`hashedInput: ${hashedInput}`);

      if (hashedInput === dbPassword && user.Enabled) {
        req.session.user = { username };
        return res.json({ success: true });
      }
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/checkAuth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/events', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const activeOnly = req.query.active === 'true';
    let querySpec = { query: 'SELECT * FROM c' };

    if (activeOnly) {
      querySpec = {
        query: 'SELECT * FROM c WHERE c.active = true'
      };
    }

    const { resources } = await eventsContainer.items.query(querySpec).fetchAll();
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

app.delete('/api/events/:eventId', async (req, res) => {

 
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;

  try {


    // Find the event by EventID
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.EventId = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources } = await eventsContainer.items.query(querySpec).fetchAll();

    if (resources.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = resources[0];

    // Delete the event by id and partition key
    await eventsContainer.item(event.id, event.EventId).delete();

    // 2. Find and Delete Registrations for this Event
    const regQuery = {
      query: 'SELECT * FROM c WHERE c.EventName = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources: registrations } = await registrationsContainer.items.query(regQuery).fetchAll();

    for (const reg of registrations) {
    
      await registrationsContainer.item(reg.id, reg.CustomerId).delete();
      
    }

    res.json({ message: 'Event and associated registrations deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});


app.patch('/api/events/:eventId/createshorturl', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;


  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.EventId = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources } = await eventsContainer.items.query(querySpec).fetchAll();
    if (resources.length === 0) return res.status(404).json({ message: 'Event not found' });

    const event = resources[0];

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Update the URL field
    // Call Bitly API to shorten it
    const bitlyRes = await createShortUrl(eventId);

    event.ShortUrl = bitlyRes.data.link;

    await eventsContainer.item(event.id, event.EventId).replace(event);

    res.json({ message: 'URL updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update event URL' });
  }
});


async function createShortUrl(eventId)
{
    try {
    // Call Bitly API to shorten it
      const bitlyRes = await axios.post(
        'https://api-ssl.bitly.com/v4/shorten',
        { 
          "long_url": `${longUrl}${eventId}`,
         
        },
        { headers: { Authorization: `Bearer ${BITLY_API_KEY}` ,
          'Content-Type': 'application/json' } }
      );

      return bitlyRes;
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event' });
  }
}


app.post('/api/events', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const newEvent = req.body;
  const newId = uuidv4();
  const newEventId = uuidv4();

    // Call Bitly API to shorten it
    const bitlyRes = await createShortUrl(newEventId);


  const eventToInsert = {
    id: newId,
    EventId: newEventId,  // If you want both id and EventId set to same GUID
    ShortUrl: bitlyRes.data.link,
    ...newEvent
  };    


  try {
    await eventsContainer.items.create(eventToInsert);
    res.json({ message: 'Event created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event' });
  }
});



app.get('/api/events/:eventId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;
  

  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.EventId = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources } = await eventsContainer.items.query(querySpec).fetchAll();
    if (resources.length === 0) return res.status(404).json({ message: 'Event not found' });

    res.json(resources[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

app.put('/api/events/:eventId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;
  const updatedData = req.body;

  try {
    const { resource: existingEvent } = await eventsContainer.item(eventId, eventId).read();
    const updatedEvent = { ...existingEvent, ...updatedData };

    await eventsContainer.items.upsert(updatedEvent);
    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update event' });
  }
});


app.get('/api/events/:eventId/registrations', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;

  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.EventName = @eventId',
      parameters: [
        { name: '@eventId', value: eventId }
      ]
    };

    const { resources } = await registrationsContainer.items.query(querySpec).fetchAll();
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});


app.get('/api/events/:eventId/registrations/:registrationId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const registrationId = req.params.registrationId;
    const querySpec = {
        query: 'SELECT * FROM c WHERE c.CustomerId = @registrationId',
        parameters: [{ name: '@registrationId', value: registrationId }]
      };

    const { resources } = await registrationsContainer.items.query(querySpec).fetchAll();
    if (resources.length === 0) return res.status(404).json({ message: 'Registration not found' });

    res.json(resources[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch registration' });
  }
});

// Update a single registration by ID
app.put('/api/events/:eventId/registrations/:registrationId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

   const registrationId = req.params.registrationId;
  const updatedData = req.body;

  try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.CustomerId = @registrationId',
        parameters: [{ name: '@registrationId', value: registrationId }]
      };

    const { resources } = await registrationsContainer.items.query(querySpec).fetchAll();
    if (resources.length === 0) return res.status(404).json({ message: 'Registration not found' });

let existing = resources[0];

    const updatedItem = { ...existing, ...updatedData };

    await registrationsContainer.items.upsert(updatedItem);
    res.json({ success: true, event: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update event' });
  }




});


app.get('/api/events/:eventId/summary', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const eventId = req.params.eventId;

  try {

    // Get event details to check MultiTicketEvent flag
    const eventQuery = {
      query: 'SELECT * FROM c WHERE c.EventId = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };
    const { resources: eventResources } = await eventsContainer.items.query(eventQuery).fetchAll();
    if (eventResources.length === 0) return res.status(404).json({ message: 'Event not found' });

    const event = eventResources[0];

    // Get registrations for this event
    const regQuery = {
      query: 'SELECT * FROM c WHERE c.EventName = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources: registrations } = await registrationsContainer.items.query(regQuery).fetchAll();

    const totalRegistrations = registrations.length;
    const paidRegistrations = registrations.filter(r => r.Paid === true);
    const giftAidRegistrations = paidRegistrations.filter(r => r.GiftAid === true);

    const totalPaid = paidRegistrations.reduce((sum, r) => sum + (parseFloat(r.DonationTotal) || 0), 0);
    const giftAidTotal = giftAidRegistrations.reduce((sum, r) => sum + (parseFloat(r.DonationTotal) || 0) * 0.25, 0);

    let totalNumberOfTickets = 0;
    if (event.MultiTicketEvent === true) {
      totalNumberOfTickets = paidRegistrations.reduce((sum, r) => sum + (parseInt(r.NumberOfTickets) || 0), 0);
    }

    res.json({
      TotalRegistrations: totalRegistrations,
      PaidRegistrations: paidRegistrations.length,
      GiftAidRegistrations: giftAidRegistrations.length,
      TotalPaid: totalPaid,
      GiftAidTotal: giftAidTotal,
      TotalNumberOfTickets: totalNumberOfTickets
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch event summary' });
  }
});




app.get('/api/registrations/:registrationId/sumup', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const registrationId = req.params.registrationId;

  try {
    // Fetch the registration record from Cosmos DB
    const query = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: registrationId }]
    };

    const { resources } = await registrationsContainer.items.query(query).fetchAll();

    if (resources.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registration = resources[0];

    if (!registration.CheckoutReference) {
      return res.status(400).json({ message: 'No checkout reference available for this registration' });
    }

    // Call SumUp API
    const sumupResponse = await axios.get(
      `https://api.sumup.com/v0.1/checkouts?checkout_reference=${registration.CheckoutReference}`,
      {
        headers: {
          Authorization: `Bearer ${SUMUP_API_KEY}`,
          Accept: 'application/json'
        }
      }
    );

    
    // The C# code expected a list, returning the first item
    const sumupData = Array.isArray(sumupResponse.data) ? sumupResponse.data[0] : sumupResponse.data;

    res.json(sumupData);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch SumUp status' });
  }
});





// Serve static frontend
app.use(express.static(path.join(__dirname, '/build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
