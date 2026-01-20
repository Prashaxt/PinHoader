const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); 
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

router.get('/api/pexels', async (req, res) => {
  const query = req.query.query || 'nature';
  const perPage = parseInt(req.query.per_page) || 5;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Pexels' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
