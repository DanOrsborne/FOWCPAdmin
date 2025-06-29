require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { usersContainer } = require('../cosmos');
const session = require('express-session');
const router = express.Router();


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
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/checkAuth', (req, res) => {
  res.json({ authenticated: !!req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

module.exports = router;
