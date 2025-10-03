require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { usersContainer, eventsContainer } = require('../cosmos');
const session = require('express-session');
const router = express.Router();
const { decrypt, encrypt } = require('../utils/crypto');


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.Email = @username',
      parameters: [{ name: '@username', value: username }]
    };

    const { resources } = await usersContainer.items.query(querySpec).fetchAll();

    if (resources.length > 0) {
      const user = resources[0];
      const hashedInput = crypto.createHash('md5').update(password + process.env.PASSWORD_HASH_SALT).digest('hex');

      if (hashedInput === user.Password && user.Enabled) {
        req.session.user = { username };
        return res.json({ success: true });
      }
    }
    res.status(200).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/checkAuth', async (req, res) => {

  console.log("Session user:", req.session.user);
  if (req.session.user == null) {
    return res.json({ authenticated: false });
  }

  const username = req.session.user.username;

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.Email = @username',
    parameters: [{ name: '@username', value: username}]
  };

  const { resources } = await usersContainer.items.query(querySpec).fetchAll();
  console.log("User resources:", querySpec);
  if (resources.length > 0) {
    const user = resources[0];
    console.log("User:", user);
    if (user.Enabled) {
      res.json({ authenticated: true });
    }
    else {
      res.json({ authenticated: false });
    }
  }




});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});


router.post('/helperlogin', async (req, res) => {
  const { eventcode, password } = req.body;
  try {
    const decrypted = await decrypt(eventcode);
    const parts = decrypted.split('$');
    const eventId = parts[0]; // "e5b7cff5-ba4f-4d73-9143-276dc86dcd7a" Event ID
    const eventPassword = parts[1]; // "animal34" Password

    if (eventPassword !== password) {

      return res.status(200).json({ success: false, message: 'Invalid credentials' });
    }

    const querySpec = {
      query: 'SELECT * FROM c WHERE c.EventId = @eventId',
      parameters: [{ name: '@eventId', value: eventId }]
    };

    const { resources } = await eventsContainer.items.query(querySpec).fetchAll();

    if (resources.length == 1) {
      if (resources[0].EventPassword !== password) {
        return res.status(200).json({ success: false, message: 'Invalid credentials' });
      }
      else {

        req.session.user = "Helper-" + eventId;
        return res.json({ success: true, eventId: eventId });
      }
    }

    return res.status(200).json({ success: false, message: 'Invalid credentials' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});



module.exports = router;
