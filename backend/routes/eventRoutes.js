require('dotenv').config();

const express = require('express');
const { eventsContainer, registrationsContainer } = require('../cosmos');
const { v4: uuidv4 } = require('uuid');
const qr = require("qr-image");
const authMiddleware = require('../utils/authMiddleware');
const { createShortUrl } = require('../utils/urlUtils');
const router = express.Router();
const axios = require('axios');
const { encrypt } = require('../utils/crypto');


const SUMUP_API_KEY = process.env.SUMUP_API_KEY


router.get('/events', authMiddleware, async (req, res) => {


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

router.delete('/events/:eventId', authMiddleware, async (req, res) => {
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


router.patch('/events/:eventId/createshorturl', authMiddleware, async (req, res) => {


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





router.get('/events/:eventId/qr', authMiddleware, async (req, res) => {


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



    const qrText = event.ShortUrl;
    const qrPng = qr.image(qrText, { type: 'png' });
    res.type('png');
    qrPng.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update event URL' });
  }
});


router.get('/events/:eventId/helperlogin', authMiddleware, async (req, res) => {


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


    const securityCode = await encrypt(event.EventId + '$' + event.EventPassword);
    const qrPng = qr.image(`https://fowcpevents-e7cydpgwakhwbvfd.uksouth-01.azurewebsites.net/helperlogin/${securityCode}`, { type: 'png' });
    res.type('png');
    qrPng.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update event URL' });
  }
});


router.post('/events', authMiddleware, async (req, res) => {


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



router.get('/events/:eventId', authMiddleware, async (req, res) => {


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

router.put('/events/:eventId', authMiddleware, async (req, res) => {


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


router.get('/events/:eventId/registrations', authMiddleware, async (req, res) => {


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




router.get('/events/:eventId/registrations/:registrationId', authMiddleware, async (req, res) => {


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


router.delete('/events/:eventId/registrations/:registrationId', authMiddleware, async (req, res) => {


  const registrationId = req.params.registrationId;
  const eventId = req.params.eventId;


  console.log(registrationId)

  try {
    // Find the event by EventID
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.CustomerId = @registrationId',
      parameters: [{ name: '@registrationId', value: registrationId }]
    };

    const { resources } = await registrationsContainer.items.query(querySpec).fetchAll();

    if (resources.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registration = resources[0];


    if (registration.EventName == eventId) {
      // Delete the registration by id and partition key
      await registrationsContainer.item(registration.id, registration.CustomerId).delete();
      res.json({ message: 'Registration deleted' });

    } else {
      return res.status(400).json({ message: 'Registration does not belong to this event' });
    }



  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete registration' });
  }
});

// Update a single registration by ID
router.put('/events/:eventId/registrations/:registrationId', authMiddleware, async (req, res) => {


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


router.get('/events/:eventId/summary', authMiddleware, async (req, res) => {


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




router.get('/registrations/:registrationId/sumup', authMiddleware, async (req, res) => {


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


module.exports = router;