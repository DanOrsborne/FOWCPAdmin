const axios = require('axios');
const BITLY_API_KEY = process.env.BITLY_API_KEY;
const longUrl = `https://fowcpevents20240928105048.azurewebsites.net/api/FOWCPEventSignup?code=2R7-QJayuS3kFRIhlH2N-FhF0xSCQIKgLrotyAAEBHgsAzFuw1G4hQ==&eventid=`;

async function createShortUrl(eventId) {
  try {
    const response = await axios.post(
      'https://api-ssl.bitly.com/v4/shorten',
      { long_url: `${longUrl}${eventId}` },
      { headers: { Authorization: `Bearer ${BITLY_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return response;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to create short URL');
  }
}

module.exports = { createShortUrl };
