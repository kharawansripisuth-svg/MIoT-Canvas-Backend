const mqttService = require('../../service/services/mqtt-service');
const influxService = require('../../service/services/influx-service');

class ServiceController {

  async mqttHealthCheck(req, res) {
    const mqtt = new mqttService();
    try {
        const status = await mqtt.healthCheck();
        return res.status(200).json({ 
            mqtt: status ? 'online' : 'offline' 
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to check MQTT connection' 
        });
    }
  }

  async checkInfluxConnection(req, res) {
    const influx = new InfluxService();
    const status = await influx.healthCheck();
        return res.status(200).json({ 
            influxdb: status ? 'online' : 'offline' 
        });
  }
}

module.exports = new ServiceController();


