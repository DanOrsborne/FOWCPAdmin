const { eventsContainer, usersContainer } = require('../cosmos');

module.exports = async function (req, res, next) {
  //console.log('Auth middleware triggered: ' + JSON.stringify(req.session.user));

  const sessionUserName = req.session.user;

  //console.log('Session user:', sessionUserName);
  if (!sessionUserName) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (sessionUserName.startsWith('Helper$')) {
    //Validate Helper Login Session
    const parts = user.split('$');

    if (parts.length !== 3) {
      return res.status(401).json({ message: 'Invalid helper session format' });
    }

    const eventId = parts[1];
    const eventPassword = parts[2];
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.EventId = @eventId',
        parameters: [{ name: '@eventId', value: eventId }]
      };

      const { resources } = await eventsContainer.items.query(querySpec).fetchAll();

      if (resources.length !== 1 || resources[0].EventPassword !== eventPassword || !resources[0].Active) {
        return res.status(401).json({ message: 'Invalid helper credentials' });
      }

      // Optional: attach event to request if needed later
      req.event = resources[0];
    } catch (err) {
      console.error('Error querying event:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  else {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.Email = @username',
        parameters: [{ name: '@username', value: sessionUserName }]
      };

      const { resources } = await usersContainer.items.query(querySpec).fetchAll();

      if (resources.length === 0) {
        console.log('User is not found:', sessionUserName);
        return res.status(401).json({ message: 'User not found' });
      }

      const user = resources[0];

      if (!user.Enabled) {
        console.log('User is not active:', sessionUserName);
        return res.status(403).json({ message: 'User is not active' });
      }

      
    } catch (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  next();
};
