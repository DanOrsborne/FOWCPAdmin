require('dotenv').config();



const express = require('express');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT;

const app = express();
const path = require('path');


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace_this_secret',
  resave: false,
  saveUninitialized: true,
}));


app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', eventRoutes);


// Serve static frontend
app.use(express.static(path.join(__dirname, '/build')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
