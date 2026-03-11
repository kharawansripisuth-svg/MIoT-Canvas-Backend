const express = require('express');
const router = express.Router();
const websocketService = require('../Service/websocket_service');

// Get WebSocket authentication token
// NOTE: This endpoint should be protected with authentication middleware
// to prevent unauthorized access. Currently open for development purposes.
router.get('/websocket/token', (req, res) => {
  try {
    const token = websocketService.getAuthToken();
    res.json({ token });
  } catch (err) {
    console.error('Error getting WebSocket token:', err);
    res.status(500).json({ error: 'Failed to get WebSocket token' });
  }
});

module.exports = router;
