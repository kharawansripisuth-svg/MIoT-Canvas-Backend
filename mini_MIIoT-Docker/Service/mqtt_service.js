require('dotenv').config();
const mqtt = require('mqtt');
const alertController = require('../Controller/AlertController');
const deviceController = require('../Controller/DeviceController');

class MQTTService {
  constructor() {
    this.client = null;
    this.websocketService = null;
    this.topics = [
      'sensor/cu_cisco',
      'sensor/cu_energymeter'
    ];
    this.latestData = new Map();
  }

  setWebSocketService(wsService) {
    this.websocketService = wsService;
  }

  connect() {
    const mqttHost = process.env.MQTT_HOST || 'mqtt';
    const mqttPort = process.env.MQTT_PORT || 1883;
    const brokerUrl = `mqtt://${mqttHost}:${mqttPort}`;

    console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

    this.client = mqtt.connect(brokerUrl, {
      clientId: `backend_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
    });

    this.client.on('reconnect', () => {
      console.log('Reconnecting to MQTT broker...');
    });
  }

  subscribeToTopics() {
    this.topics.forEach(topic => {
      this.client.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      const timestamp = new Date().toISOString();

      // Extract device info from payload
      const deviceInfo = this.extractDeviceInfo(topic, data);

      if (deviceInfo) {
        // Store latest data
        const key = `${deviceInfo.device_name}_${deviceInfo.device_number}`;
        this.latestData.set(key, {
          ...data,
          topic,
          timestamp,
          device_name: deviceInfo.device_name,
          device_number: deviceInfo.device_number
        });

        // Update device last_seen
        await deviceController.updateDeviceLastSeen(
          deviceInfo.device_name,
          deviceInfo.device_number
        );

        // Check thresholds and create alerts
        await this.checkAlerts(deviceInfo, data);

        // Broadcast to WebSocket clients
        if (this.websocketService) {
          this.websocketService.broadcast({
            type: 'measurement',
            topic,
            device: deviceInfo,
            data,
            timestamp
          });
        }
      }
    } catch (err) {
      console.error('Error handling MQTT message:', err);
    }
  }

  extractDeviceInfo(topic, data) {
    // Try to extract device info from various payload formats
    if (data.device_name && data.device_number !== undefined) {
      return {
        device_name: data.device_name,
        device_number: data.device_number
      };
    }

    // For cu_cisco topic
    if (topic === 'sensor/cu_cisco' && data.name) {
      // Format: cu_ciscomt15_001
      const match = data.name.match(/^(cu_\w+?)_?(\d+)?$/);
      if (match) {
        return {
          device_name: match[1],
          device_number: match[2] || '001'
        };
      }
    }

    // For cu_energymeter topic
    if (topic === 'sensor/cu_energymeter' && data.device) {
      return {
        device_name: 'cu_energymeter',
        device_number: data.device || '001'
      };
    }

    // Default extraction from tokenid if present
    if (data.tokenid) {
      const parts = data.tokenid.split('_');
      if (parts.length >= 2) {
        return {
          device_name: parts.slice(0, -1).join('_'),
          device_number: parts[parts.length - 1]
        };
      }
    }

    return null;
  }

  async checkAlerts(deviceInfo, data) {
    try {
      // Get device ID from database
      const pgService = require('./postgres_service');
      const deviceResult = await pgService.query(`
        SELECT device_id FROM devices
        WHERE device_name = $1 AND device_number = $2
      `, [deviceInfo.device_name, deviceInfo.device_number]);

      if (deviceResult.length === 0) return;

      const deviceId = deviceResult[0].device_id;

      // Check each field in the data
      for (const [field, value] of Object.entries(data)) {
        if (typeof value !== 'number') continue;

        const violations = await alertController.checkThresholds(deviceId, field, value);

        for (const violation of violations) {
          // Log the violation
          await alertController.logAlertViolation(
            deviceId,
            violation.alert_id,
            field,
            value,
            violation.type,
            violation.threshold
          );

          // Broadcast alert to WebSocket clients
          if (this.websocketService) {
            this.websocketService.broadcast({
              type: 'alert',
              device: deviceInfo,
              field,
              value,
              threshold_type: violation.type,
              threshold_value: violation.threshold,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
      console.error('Error checking alerts:', err);
    }
  }

  getLatestData(deviceName, deviceNumber) {
    const key = `${deviceName}_${deviceNumber}`;
    return this.latestData.get(key);
  }

  getAllLatestData() {
    return Object.fromEntries(this.latestData);
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('MQTT client disconnected');
    }
  }
}

module.exports = new MQTTService();
