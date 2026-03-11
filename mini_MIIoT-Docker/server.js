require('dotenv').config();
const http = require('http');
const app = require('./App');
const websocketService = require('./Service/websocket_service');
const mqttService = require('./Service/mqtt_service');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
websocketService.initialize(server);
websocketService.startHeartbeat();

// Connect MQTT service and link to WebSocket
mqttService.setWebSocketService(websocketService);
mqttService.connect();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  mqttService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});