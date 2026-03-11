const WebSocket = require('ws');
const crypto = require('crypto');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    // Use environment variable or generate a secure token
    this.authToken = process.env.WS_AUTH_TOKEN || this.generateSecureToken();
    if (!process.env.WS_AUTH_TOKEN) {
      console.log('WebSocket authentication enabled with auto-generated token');
    }
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyAuthentication(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        return { valid: false, error: 'No authentication token provided' };
      }

      // Use timing-safe comparison to prevent timing attacks
      const expectedToken = Buffer.from(this.authToken, 'utf-8');
      const providedToken = Buffer.from(token, 'utf-8');
      
      if (expectedToken.length !== providedToken.length) {
        return { valid: false, error: 'Invalid authentication token' };
      }
      
      if (!crypto.timingSafeEqual(expectedToken, providedToken)) {
        return { valid: false, error: 'Invalid authentication token' };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: 'Authentication verification failed' };
    }
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        const authResult = this.verifyAuthentication(info.req);
        
        if (!authResult.valid) {
          console.log('WebSocket authentication failed:', authResult.error);
          // Use WebSocket close code 1008 (policy violation) for auth failures
          callback(false, 1008, authResult.error);
          return;
        }
        
        callback(true);
      }
    });

    console.log('WebSocket server initialized on /ws with authentication enabled');

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (err) => {
      console.error('WebSocket server error:', err);
    });
  }

  getAuthToken() {
    return this.authToken;
  }

  handleConnection(ws, req) {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientIp = req.socket.remoteAddress;

    console.log(`WebSocket client connected: ${clientId} from ${clientIp}`);

    // Add client to set
    this.clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      this.handleMessage(ws, message, clientId);
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      this.clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (err) => {
      console.error(`WebSocket client error (${clientId}):`, err);
      this.clients.delete(ws);
    });

    // Setup heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }

  handleMessage(ws, message, clientId) {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;

        case 'subscribe':
          // Handle topic subscription (for future use)
          ws.subscriptions = ws.subscriptions || new Set();
          if (data.topics && Array.isArray(data.topics)) {
            data.topics.forEach(topic => ws.subscriptions.add(topic));
          }
          ws.send(JSON.stringify({
            type: 'subscribed',
            topics: Array.from(ws.subscriptions)
          }));
          break;

        case 'unsubscribe':
          if (ws.subscriptions && data.topics) {
            data.topics.forEach(topic => ws.subscriptions.delete(topic));
          }
          break;

        default:
          console.log(`Unknown message type from ${clientId}:`, data.type);
      }
    } catch (err) {
      console.error(`Error handling message from ${clientId}:`, err);
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          // Check if client has subscription filter
          if (client.subscriptions && client.subscriptions.size > 0) {
            // Only send if message matches subscription
            if (message.topic && client.subscriptions.has(message.topic)) {
              client.send(messageStr);
            } else if (message.type === 'alert') {
              // Always send alerts
              client.send(messageStr);
            }
          } else {
            // No subscription filter, send all messages
            client.send(messageStr);
          }
        } catch (err) {
          console.error('Error broadcasting to client:', err);
        }
      }
    });
  }

  broadcastToDevice(deviceName, deviceNumber, message) {
    const messageStr = JSON.stringify({
      ...message,
      device: { device_name: deviceName, device_number: deviceNumber }
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (err) {
          console.error('Error broadcasting to client:', err);
        }
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  startHeartbeat(interval = 30000) {
    setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          console.log('Terminating inactive WebSocket client');
          this.clients.delete(ws);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, interval);
  }
}

module.exports = new WebSocketService();
